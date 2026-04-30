output "alb_dns_name"            { value = aws_lb.main.dns_name }
output "frontend_bucket_name"    { value = aws_s3_bucket.frontend.bucket }
output "frontend_website_url"    { value = aws_s3_bucket_website_configuration.frontend.website_endpoint }
output "ecs_service_name"        { value = aws_ecs_service.backend.name }
output "github_actions_role_arn" { value = aws_iam_role.github_actions.arn }