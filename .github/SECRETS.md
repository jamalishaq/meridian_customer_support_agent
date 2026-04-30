# GitHub Actions — Required Secrets

All secrets are set in **Settings → Secrets and variables → Actions** on the GitHub repository.
No AWS long-lived credentials are stored here — authentication is via OIDC only.

| Secret | Description | Where to get the value |
|---|---|---|
| `AWS_ROLE_ARN` | ARN of the GitHub Actions IAM role | Terraform output: `github_actions_role_arn` |
| `AWS_REGION` | AWS region where all resources are deployed | The region you ran `terraform apply` in (e.g. `us-east-1`) |
| `ECR_REPOSITORY` | ECR repository **name** (not the full URI — the workflow constructs the URI) | ECR console → repository name, or the value of `var.ecr_repository_name` in `terraform.tfvars` |
| `ECS_CLUSTER` | ECS cluster name | Terraform output: `ecs_cluster_name` |
| `ECS_SERVICE` | ECS service name (also used as the task-definition family name) | Terraform output: `ecs_service_name` |
| `S3_BUCKET` | Frontend S3 bucket name | Terraform output: `frontend_bucket_name` |
| `ALB_DNS_NAME` | ALB DNS name **without** the `http://` scheme — baked into the frontend bundle at build time | Terraform output: `alb_dns_name` |

## Retrieving Terraform outputs

After `terraform apply`, run:

```bash
cd terraform
terraform output
```

## Never store

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Both workflows authenticate exclusively via OIDC using the `AWS_ROLE_ARN` secret above.
