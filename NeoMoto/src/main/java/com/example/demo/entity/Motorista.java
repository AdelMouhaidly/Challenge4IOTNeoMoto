package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "motoristas")
public class Motorista {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nome;
    
    @Column(nullable = false, unique = true)
    private String cpf;
    
    @Column(nullable = false)
    private String telefone;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String cnh;
    
    @Column(nullable = false)
    private String endereco;
    
    @Column(nullable = false)
    private String status = "ativo";
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moto_id")
    @JsonIgnoreProperties({"motoristas"})
    private Moto moto;
    
    public Motorista() {}
    
    public Motorista(String nome, String cpf, String telefone, String email, String cnh, String endereco, String status) {
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
        this.email = email;
        this.cnh = cnh;
        this.endereco = endereco;
        this.status = status;
    }
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
    
    public Moto getMoto() {
        return moto;
    }
    
    public void setMoto(Moto moto) {
        this.moto = moto;
    }
}
