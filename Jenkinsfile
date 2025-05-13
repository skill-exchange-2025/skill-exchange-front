pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'skill-exchange-frontend'
        DOCKER_TAG = "${env.BUILD_ID}"
        SONAR_PROJECT_KEY = 'skill-exchange-frontend'
    }

    tools {
        nodejs 'NODE'  // References your Node installation named "NODE"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint -- --no-fix || true' // Run lint but don't fail the build
            }
        }
        /*

        stage('Test') {
            steps {
                sh 'npm test -- --passWithNoTests || true' // Run tests if they exist
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        npm install -g sonarqube-scanner
                        sonar-scanner \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions=**/*.spec.js,**/*.spec.jsx,**/*.spec.ts,**/*.spec.tsx,**/*.test.js,**/*.test.jsx,**/*.test.ts,**/*.test.tsx \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_AUTH_TOKEN}
                    """
                }
            }
        }
        */

        stage('Build') {
            steps {
                // Set environment variables for build
                withEnv(['TSC_COMPILE_ON_ERROR=true', 'ESLINT_NO_DEV_ERRORS=true', 'DISABLE_ESLINT_PLUGIN=true']) {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Start Services') {
            steps {
                sh 'docker-compose down || true' // Don't fail if services aren't running
                sh 'docker-compose up -d'
            }
        }

        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to development environment'
                // Assuming docker-compose is properly configured for development
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                echo 'Deploying to production environment'
                // Create a production-specific docker-compose file if needed
                sh 'docker-compose -f docker-compose.prod.yml down || true'
                sh 'docker-compose -f docker-compose.prod.yml up -d'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Frontend build and deployment completed successfully!'
        }
        failure {
            echo 'Frontend build or deployment failed!'
        }
    }
}
