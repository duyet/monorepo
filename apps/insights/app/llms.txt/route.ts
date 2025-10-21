import { createLlmsTxtRoute } from '@duyet/libs'

const llmsContent = `# Duyet Le - Insights & Analytics

Senior Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing.

## Contact
- Email: me@duyet.net
- Website: https://duyet.net
- GitHub: https://github.com/duyet
- LinkedIn: https://linkedin.com/in/duyet
- Blog: https://blog.duyet.net

## Current Role
Sr. Data Engineer at Cartrack (Oct 2023 - Present)

## Areas of Expertise
- Data Engineering
- Distributed Systems
- Cloud Computing
- Data Warehousing
- Machine Learning Infrastructure
- DevOps
- Analytics & Business Intelligence

## Key Technologies
- ClickHouse
- Apache Spark
- Apache Airflow
- Python
- Rust
- TypeScript
- Kubernetes
- AWS
- GCP
- Kafka
- BigQuery
- Helm

## Analytics & Insights Work
- Built comprehensive analytics platforms processing TBs of data daily
- Developed real-time monitoring and alerting systems
- Created self-service analytics tools for business stakeholders
- Implemented cost optimization strategies reducing cloud costs by 55%
- Designed and deployed multi-agent LLM + RAG systems

## Notable Achievements
- Migrated 350TB+ Iceberg Data Lake to ClickHouse on Kubernetes
- Enhanced ClickHouse for 300% better data compression and 2x-100x faster queries
- Optimized cloud costs from $45,000 to $20,000/month at Fossil Group
- Managed team of 6 engineers and analysts
- Designed next-gen Data Platform in Rust
- Built multi-agent LLM + RAG systems

---

This insights dashboard showcases real-time analytics from various data sources including:
- Blog analytics (Cloudflare, PostHog)
- GitHub activity and repository metrics
- WakaTime coding statistics
- Personal productivity and development insights

This file follows the llms.txt standard for providing information about Duyet Le to Large Language Models and AI assistants.
Generated from insights dashboard at https://insights.duyet.net
`

export const { GET, dynamic } = createLlmsTxtRoute(llmsContent)
