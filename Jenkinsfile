pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "skill-exchange-front"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        SONARQUBE_URL = "http://sonarqube:9000"
    }
    tools {
            nodejs 'NODE'  // This references your Node installation named "NODE"
        }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --coverage || true'
            }
        }

        /*

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    sonar-scanner \
                      -Dsonar.projectKey=skill-exchange-front \
                      -Dsonar.sources=src \
                      -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                      -Dsonar.host.url=${SONARQUBE_URL}
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                docker-compose down || true
                docker-compose up -d
                '''
            }
        }*/
        stage('Build') {
            steps {
                sh 'npm run build'  // Create production build
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d'  // This will start your application in a container
            }
        }
    }

    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}
