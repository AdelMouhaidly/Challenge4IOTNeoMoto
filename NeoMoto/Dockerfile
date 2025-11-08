FROM gradle:7.6-jdk17 AS build
WORKDIR /app
COPY . .
RUN ./gradlew build -x test

FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/build/libs/neomoto-0.0.1.jar app.jar
EXPOSE 8080
ENV PORT=8080
CMD ["sh", "-c", "java -jar -Dserver.port=${PORT} app.jar"]
