#!groovy
import jenkins.model.*
import hudson.security.*
import jenkins.install.InstallState

def instance = Jenkins.get()

println("--> [Automated Setup] Configuring Jenkins admin1 credentials...")

// 1. Create native security realm with user admin1
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin1", "admin1")
instance.setSecurityRealm(hudsonRealm)

// 2. Full Control Once Logged In Authorization
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

// 3. Complete Initial Setup (Bypasses manual unlock key requirement)
instance.setInstallState(InstallState.INITIAL_SETUP_COMPLETED)
instance.save()

println("--> [Automated Setup] Successfully configured admin1 / admin1 with Full Control!")

