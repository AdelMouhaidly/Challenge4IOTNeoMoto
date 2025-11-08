package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@Entity
@Table(name = "motos")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Moto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String marca;
    
    @Column(nullable = false)
    private String configuracoes;
    
    @Column(nullable = false)
    private String status = "parada";
    
    @Column(nullable = false)
    private Double x;
    
    @Column(nullable = false)
    private Double y;
    
    @OneToMany(mappedBy = "moto", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"moto"})
    private List<Motorista> motoristas;
    
    public Moto() {}
    
    public Moto(String name, String marca, String configuracoes, String status, Double x, Double y) {
        this.name = name;
        this.marca = marca;
        this.configuracoes = configuracoes;
        this.status = status;
        this.x = x;
        this.y = y;
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
    
    public Double getX() {
        return x;
    }
    
    public void setX(Double x) {
        this.x = x;
    }
    
    public Double getY() {
        return y;
    }
    
    public void setY(Double y) {
        this.y = y;
    }
    
    public List<Motorista> getMotoristas() {
        return motoristas;
    }
    
    public void setMotoristas(List<Motorista> motoristas) {
        this.motoristas = motoristas;
    }
}
