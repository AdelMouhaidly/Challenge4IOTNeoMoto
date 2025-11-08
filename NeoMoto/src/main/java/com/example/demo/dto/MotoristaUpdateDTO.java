package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MotoristaUpdateDTO {
    private String nome;
    private String cpf;
    private String telefone;
    private String email;
    private String cnh;
    private String endereco;
    private String status;
    private MotoUpdateDTO moto;

    public MotoristaUpdateDTO() {}

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCnh() {
        return cnh;
    }

    public void setCnh(String cnh) {
        this.cnh = cnh;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public MotoUpdateDTO getMoto() {
        return moto;
    }

    public void setMoto(MotoUpdateDTO moto) {
        this.moto = moto;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MotoUpdateDTO {
        private Long id;
        private String name;
        private String marca;
        private String configuracoes;
        private String status;

        public MotoUpdateDTO() {}

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getMarca() {
            return marca;
        }

        public void setMarca(String marca) {
            this.marca = marca;
        }

        public String getConfiguracoes() {
            return configuracoes;
        }

        public void setConfiguracoes(String configuracoes) {
            this.configuracoes = configuracoes;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}

