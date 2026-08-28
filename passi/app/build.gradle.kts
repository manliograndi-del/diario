plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
}

android {
  namespace = "it.manlio.diariopassi"
  compileSdk = 34

  defaultConfig {
    applicationId = "it.manlio.diariopassi"
    minSdk = 28
    targetSdk = 34
    versionCode = 1
    versionName = "1.0"
  }
  buildTypes { release { isMinifyEnabled = false } }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
  kotlinOptions { jvmTarget = "17" }
}

dependencies {
  // legge i passi dal magazzino di salute del telefono
  implementation("androidx.health.connect:connect-client:1.1.0-beta01")
  // serve per chiedere il permesso e per far girare la lettura fuori dallo schermo
  implementation("androidx.activity:activity-ktx:1.9.2")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
