pipeline {
    agent any

    stages {
        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Deploy to AWS Docker') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }
    }
}