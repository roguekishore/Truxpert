# Use an official Maven image to build the Spring Boot app 
FROM maven:3.9-eclipse-temurin-17 AS build 

#Set the working directory 
WORKDIR /app 

#Copy the pom.xml and install dependencies 
COPY pom.xml .
RUN mvn dependency:go-offline 

# Copy the source code and build the application 
COPY src ./src 
RUN mvn clean package -DskipTests 

# Use an official Eclipse Temurin image to run the application
FROM eclipse-temurin:17-jre-jammy

#Set the working directory 
WORKDIR /app
 
#Copy the built JAR file from the build stage 
COPY --from=build /app/target/truxpert-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080 
EXPOSE 8080

ENV JAVA_OPTS="-Xms64m -Xmx200m -XX:MaxMetaspaceSize=80m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"

# Use shell form so JAVA_OPTS env var is expanded
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

