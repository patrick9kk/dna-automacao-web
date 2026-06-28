resource "aws_api_gateway_rest_api" "reports_api" {
  name        = "${var.project_name}-reports-api-${var.environment}"
  description = "API para solicitação e consulta de relatórios assíncronos"
}

resource "aws_api_gateway_resource" "reports" {
  rest_api_id = aws_api_gateway_rest_api.reports_api.id
  parent_id   = aws_api_gateway_rest_api.reports_api.root_resource_id
  path_part   = "reports"
}

resource "aws_api_gateway_method" "post_report" {
  rest_api_id   = aws_api_gateway_rest_api.reports_api.id
  resource_id   = aws_api_gateway_resource.reports.id
  http_method   = "POST"
  authorization = "AWS_IAM"
}

resource "aws_api_gateway_integration" "post_report_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.reports_api.id
  resource_id             = aws_api_gateway_resource.reports.id
  http_method             = aws_api_gateway_method.post_report.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.request_report.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_request_report" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.request_report.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.reports_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "reports_api" {
  depends_on  = [aws_api_gateway_integration.post_report_lambda]
  rest_api_id = aws_api_gateway_rest_api.reports_api.id
}

resource "aws_api_gateway_stage" "reports_api" {
  deployment_id = aws_api_gateway_deployment.reports_api.id
  rest_api_id   = aws_api_gateway_rest_api.reports_api.id
  stage_name    = var.environment
}

output "api_endpoint" {
  value = "${aws_api_gateway_stage.reports_api.invoke_url}/reports"
}
