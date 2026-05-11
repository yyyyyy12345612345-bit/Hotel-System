@echo off
:: Set Java Home
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.11"
:: Set Maven Path (assuming it's in the project folder)
set "MAVEN_BIN=%CD%\apache-maven-3.9.6\bin"

:: Update PATH
set "PATH=%SystemRoot%\system32;%SystemRoot%;%JAVA_HOME%\bin;%MAVEN_BIN%"

echo Starting Hotel Management System (Cloud)...
echo ------------------------------------------
mvn clean compile exec:java -Dexec.mainClass="Main"
pause
