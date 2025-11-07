# Use uma imagem base com Java 17
FROM gradle:7.6-jdk17 AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do projeto
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src

# Construir o projeto
RUN gradle build -x test --no-daemon

# Imagem final - usando Eclipse Temurin (OpenJDK oficial)
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copiar o JAR construído
COPY --from=build /app/build/libs/neomoto-0.0.1.jar app.jar

# Expor a porta (Render usa variável PORT)
EXPOSE 8080

# Comando para iniciar
ENTRYPOINT ["java", "-Dserver.port=${PORT:-8080}", "-jar", "app.jar"]

