package com.example.demo.dto;

public class MotoristaDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String telefone;
    private String email;
    private String cnh;
    private String endereco;
    private String status;
    private MotoSimpleDTO moto;

    // Constructors
    public MotoristaDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public MotoSimpleDTO getMoto() {
        return moto;
    }

    public void setMoto(MotoSimpleDTO moto) {
        this.moto = moto;
    }

    // DTO simples para Moto (evita referência circular)
    public static class MotoSimpleDTO {
        private Long id;
        private String name;
        private String marca;

        public MotoSimpleDTO() {}

        public MotoSimpleDTO(Long id, String name, String marca) {
            this.id = id;
            this.name = name;
            this.marca = marca;
        }

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
    }
}
