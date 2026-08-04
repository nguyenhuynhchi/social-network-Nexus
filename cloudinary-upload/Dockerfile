# Giai đoạn 1: Build file JAR (Maven với JDK 21)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy toàn bộ file cấu hình
COPY pom.xml .
COPY src ./src

# Copy toàn bộ code và build file JAR
RUN mvn clean package -DskipTests --no-transfer-progress

# Giai đoạn 2: Chạy ứng dụng 
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file jar đã build từ Stage 1
COPY --from=build /app/target/*.jar app.jar

# Port của service (Bạn thay đổi số này cho từng service: 8080, 8081, 8082...)
EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]