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
                sh 'sudo docker compose down'
                sh 'sudo docker compose up -d --build'
            }
        }
    }
}