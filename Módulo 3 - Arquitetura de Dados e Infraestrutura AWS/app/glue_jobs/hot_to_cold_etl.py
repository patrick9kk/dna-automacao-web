"""
AWS Glue ETL Job: hot_to_cold_etl
Migra registros de automação do RDS PostgreSQL (hot data) para o
S3 Data Lake em formato Apache Parquet particionado (cold data).

Execução: diária às 2h UTC via Glue Trigger.
Job Bookmark habilitado para processar apenas novos registros.
"""
import sys
import json
import boto3
from datetime import datetime, timezone, timedelta
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame
from pyspark.sql.functions import (
    col, year, month, dayofmonth, to_timestamp,
    lit, current_timestamp
)

# ── Argumentos do job ──────────────────────────────────────────────────────
args = getResolvedOptions(sys.argv, [
    "JOB_NAME",
    "RDS_SECRET_ARN",
    "DATALAKE_BUCKET",
    "HOT_DATA_DAYS",
    "DATABASE_NAME",
    "GLUE_DATABASE",
])

sc           = SparkContext()
glueContext  = GlueContext(sc)
spark        = glueContext.spark_session
job          = Job(glueContext)
job.init(args["JOB_NAME"], args)

DATALAKE_BUCKET = args["DATALAKE_BUCKET"]
HOT_DATA_DAYS   = int(args["HOT_DATA_DAYS"])
DB_NAME         = args["DATABASE_NAME"]
GLUE_DB         = args["GLUE_DATABASE"]

# ── Recupera credenciais do Secrets Manager ────────────────────────────────
def get_rds_credentials(secret_arn: str) -> dict:
    client = boto3.client("secretsmanager")
    secret = client.get_secret_value(SecretId=secret_arn)
    return json.loads(secret["SecretString"])

creds = get_rds_credentials(args["RDS_SECRET_ARN"])
JDBC_URL = f"jdbc:postgresql://{creds['host']}:{creds['port']}/{creds['dbname']}"

# ── Data de corte: registros mais antigos que HOT_DATA_DAYS ───────────────
cutoff_date = (datetime.now(timezone.utc) - timedelta(days=HOT_DATA_DAYS)).date()
print(f"[ETL] Migrando registros anteriores a {cutoff_date} para o Data Lake")

# ── Tabelas a migrar ────────────────────────────────────────────────────────
TABLES_TO_MIGRATE = [
    {
        "table":     "automation_readings",
        "timestamp_col": "reading_timestamp",
        "partition_cols": ["year", "month", "day", "plant", "department"],
        "s3_prefix": "automation-data/readings",
    },
    {
        "table":     "device_events",
        "timestamp_col": "event_timestamp",
        "partition_cols": ["year", "month", "day", "event_type"],
        "s3_prefix": "automation-data/events",
    },
    {
        "table":     "alert_history",
        "timestamp_col": "triggered_at",
        "partition_cols": ["year", "month", "severity"],
        "s3_prefix": "automation-data/alerts",
    },
]


def migrate_table(table_config: dict):
    table     = table_config["table"]
    ts_col    = table_config["timestamp_col"]
    s3_prefix = table_config["s3_prefix"]
    parts     = table_config["partition_cols"]

    print(f"[ETL] Iniciando migração da tabela: {table}")

    # Lê do RDS via JDBC usando Job Bookmark para processar apenas novos registros
    dyf = glueContext.create_dynamic_frame.from_options(
        connection_type = "postgresql",
        connection_options = {
            "url":      JDBC_URL,
            "dbtable":  f"(SELECT * FROM {table} WHERE {ts_col} < '{cutoff_date}') AS subq",
            "user":     creds["username"],
            "password": creds["password"],
        },
        transformation_ctx = f"datasource_{table}",
    )

    if dyf.count() == 0:
        print(f"[ETL] Nenhum registro novo em {table}. Pulando.")
        return

    print(f"[ETL] {dyf.count()} registros encontrados em {table}")

    # Converte para Spark DataFrame e enriquece com colunas de partição
    df = dyf.toDF()
    df = (df
        .withColumn("year",  year(col(ts_col)).cast("string"))
        .withColumn("month", month(col(ts_col)).cast("string").alias("month"))
        .withColumn("day",   dayofmonth(col(ts_col)).cast("string"))
        .withColumn("_migrated_at", current_timestamp())
    )

    # Escreve em Parquet particionado no S3
    output_path = f"s3://{DATALAKE_BUCKET}/{s3_prefix}/"
    (df.write
        .mode("append")
        .partitionBy(*parts)
        .option("compression", "snappy")
        .parquet(output_path)
    )
    print(f"[ETL] Tabela {table} escrita em {output_path}")

    # Atualiza catálogo Glue
    glueContext.write_dynamic_frame.from_catalog(
        frame          = DynamicFrame.fromDF(df, glueContext, f"sink_{table}"),
        database       = GLUE_DB,
        table_name     = table,
        transformation_ctx = f"sink_{table}",
    )

    # Remove registros migrados do RDS (libera espaço hot storage)
    _delete_migrated_records(table, ts_col)


def _delete_migrated_records(table: str, ts_col: str):
    """
    Deleta registros migrados do RDS em batches para não bloquear a tabela.
    Usa conexão JDBC via PySpark para executar o DELETE.
    """
    delete_sql = f"DELETE FROM {table} WHERE {ts_col} < '{cutoff_date}'"
    print(f"[ETL] Deletando registros migrados: {delete_sql}")

    # Executa via JDBC direto
    import psycopg2
    conn = psycopg2.connect(
        host     = creds["host"],
        port     = creds["port"],
        dbname   = creds["dbname"],
        user     = creds["username"],
        password = creds["password"],
    )
    try:
        with conn.cursor() as cur:
            cur.execute(delete_sql)
            deleted = cur.rowcount
            conn.commit()
            print(f"[ETL] {deleted} registros deletados de {table}")
    finally:
        conn.close()


# ── Execução principal ─────────────────────────────────────────────────────
for table_cfg in TABLES_TO_MIGRATE:
    try:
        migrate_table(table_cfg)
    except Exception as e:
        print(f"[ETL][ERROR] Falha na tabela {table_cfg['table']}: {e}")
        raise

job.commit()
print("[ETL] Job concluído com sucesso.")
