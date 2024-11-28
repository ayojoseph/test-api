# Docker commands to run the container
- docker build -t test-api:latest . (make sure you don't have node_modules installed when building. Might cause issues with copying code into container)
- docker run -d -p 3000:3000 --name test-api test-api:latest

# Kubernetes Setup
- Docker image should be built and pushed to a container registry that k8s cluster has access too. (I used dockerhub)
- Run: kubectl apply -f pod-deployment.yaml 
- This creates a deployment and service for the pod so that it can be accessed through load balancer.
- I used minikube locally and a k8s tool called Lens to port forward through the service locally.

# Running Application Locally (Nodejs 18.15.0 required)
- npm install
- npm start

# Running Tests
- npm test or npm run test
- Would automate these tests in CI/CD pipeline by including the npm test command into Github actions jobs/tasks to complete before deployment steps
- 

# CI/CD Steps
- Would use github actions to run tests, build, and deploy application
- Either deploy to a kubernetes cluster or a serverless product like Lambda, cloud run, or ECS (Elastic Container Service).
- I would use a simple github actions pipeline yaml (lives under .github/workflows)
  - this yaml will have the settings and setup for running tests, building container images, pushing to container registies and deploying to desired service(s)
  - You can either have deploys triggered on pushes or on pr merges to specific branches like master
# Other notes
- Single container application that runs both the REST api and database. 
- Database is stored in container or locally. If container or db file is deleted then data is gone.
- Exported a postman collection to help test out different endpoint in the application.