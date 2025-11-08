package com.example.demo.controller;

import com.example.demo.entity.Motorista;
import com.example.demo.entity.Moto;
import com.example.demo.repository.MotoristaRepository;
import com.example.demo.repository.MotoRepository;
import com.example.demo.dto.MotoristaDTO;
import com.example.demo.dto.MotoristaUpdateDTO;
import com.example.demo.util.DTOConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/motoristas")
@CrossOrigin(origins = "*")
public class MotoristaController {

    @Autowired
    private MotoristaRepository motoristaRepository;
    
    @Autowired
    private MotoRepository motoRepository;

    // GET - Listar todos os motoristas
    @GetMapping
    public List<MotoristaDTO> getAllMotoristas() {
        List<Motorista> motoristas = motoristaRepository.findAll();
        return DTOConverter.toDTOList(motoristas);
    }

    // GET - Buscar motorista por ID
    @GetMapping("/{id}")
    public ResponseEntity<MotoristaDTO> getMotoristaById(@PathVariable Long id) {
        Optional<Motorista> motorista = motoristaRepository.findById(id);
        if (motorista.isPresent()) {
            return ResponseEntity.ok(DTOConverter.toDTO(motorista.get()));
        }
        return ResponseEntity.notFound().build();
    }

    // GET - Buscar motoristas por status
    @GetMapping("/status/{status}")
    public List<MotoristaDTO> getMotoristasByStatus(@PathVariable String status) {
        List<Motorista> motoristas = motoristaRepository.findByStatus(status);
        return DTOConverter.toDTOList(motoristas);
    }

    // GET - Buscar motoristas por moto
    @GetMapping("/moto/{motoId}")
    public List<MotoristaDTO> getMotoristasByMoto(@PathVariable Long motoId) {
        List<Motorista> motoristas = motoristaRepository.findByMotoId(motoId);
        return DTOConverter.toDTOList(motoristas);
    }

    // POST - Criar novo motorista
    @PostMapping
    public ResponseEntity<?> createMotorista(@RequestBody Motorista motorista) {
        try {
            // Verificar se CPF já existe
            if (motorista.getCpf() != null && motoristaRepository.findByCpf(motorista.getCpf()).isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\":\"CPF já cadastrado\"}");
            }
            
            // Verificar se email já existe
            if (motorista.getEmail() != null && motoristaRepository.findByEmail(motorista.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Email já cadastrado\"}");
            }
            
            // Definir status padrão se não informado
            if (motorista.getStatus() == null || motorista.getStatus().isEmpty()) {
                motorista.setStatus("ativo");
            }
            
            // Processar moto associada
            if (motorista.getMoto() != null && motorista.getMoto().getId() != null) {
                Optional<Moto> optionalMoto = motoRepository.findById(motorista.getMoto().getId());
                if (optionalMoto.isPresent()) {
                    motorista.setMoto(optionalMoto.get());
                } else {
                    return ResponseEntity.badRequest().body("{\"error\":\"Moto não encontrada\"}");
                }
            } else {
                // Se moto não foi enviada ou não tem ID, desassociar
                motorista.setMoto(null);
            }
            
            Motorista motoristasSalvo = motoristaRepository.save(motorista);
            return ResponseEntity.ok(DTOConverter.toDTO(motoristasSalvo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Erro ao salvar motorista: " + e.getMessage() + "\"}");
        }
    }

    // POST - Associar motorista a uma moto
    @PostMapping("/{motoristaId}/moto/{motoId}")
    public ResponseEntity<Motorista> associarMotoAoMotorista(@PathVariable Long motoristaId, @PathVariable Long motoId) {
        Optional<Motorista> optionalMotorista = motoristaRepository.findById(motoristaId);
        Optional<Moto> optionalMoto = motoRepository.findById(motoId);
        
        if (optionalMotorista.isPresent() && optionalMoto.isPresent()) {
            Motorista motorista = optionalMotorista.get();
            Moto moto = optionalMoto.get();
            
            motorista.setMoto(moto);
            return ResponseEntity.ok(motoristaRepository.save(motorista));
        }
        
        return ResponseEntity.notFound().build();
    }

    // PUT - Atualizar motorista
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMotorista(@PathVariable Long id, @RequestBody MotoristaUpdateDTO motoristaDetails) {
        try {
            Optional<Motorista> optionalMotorista = motoristaRepository.findById(id);
            
            if (!optionalMotorista.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Motorista motorista = optionalMotorista.get();
            
            // Validar CPF duplicado (exceto o próprio motorista)
            if (motoristaDetails.getCpf() != null && !motoristaDetails.getCpf().equals(motorista.getCpf())) {
                Optional<Motorista> motoristaComCpf = motoristaRepository.findByCpf(motoristaDetails.getCpf());
                if (motoristaComCpf.isPresent() && !motoristaComCpf.get().getId().equals(id)) {
                    return ResponseEntity.badRequest().body("{\"error\":\"CPF já cadastrado\"}");
                }
            }
            
            // Validar email duplicado (exceto o próprio motorista)
            if (motoristaDetails.getEmail() != null && !motoristaDetails.getEmail().equals(motorista.getEmail())) {
                Optional<Motorista> motoristaComEmail = motoristaRepository.findByEmail(motoristaDetails.getEmail());
                if (motoristaComEmail.isPresent() && !motoristaComEmail.get().getId().equals(id)) {
                    return ResponseEntity.badRequest().body("{\"error\":\"Email já cadastrado\"}");
                }
            }
            
            // Atualizar campos básicos
            if (motoristaDetails.getNome() != null && !motoristaDetails.getNome().isEmpty()) {
                motorista.setNome(motoristaDetails.getNome());
            }
            if (motoristaDetails.getTelefone() != null && !motoristaDetails.getTelefone().isEmpty()) {
                motorista.setTelefone(motoristaDetails.getTelefone());
            }
            if (motoristaDetails.getEmail() != null && !motoristaDetails.getEmail().isEmpty()) {
                motorista.setEmail(motoristaDetails.getEmail());
            }
            if (motoristaDetails.getCnh() != null && !motoristaDetails.getCnh().isEmpty()) {
                motorista.setCnh(motoristaDetails.getCnh());
            }
            if (motoristaDetails.getEndereco() != null && !motoristaDetails.getEndereco().isEmpty()) {
                motorista.setEndereco(motoristaDetails.getEndereco());
            }
            if (motoristaDetails.getStatus() != null && !motoristaDetails.getStatus().isEmpty()) {
                motorista.setStatus(motoristaDetails.getStatus());
            }
            
            // Atualizar moto associada
            if (motoristaDetails.getMoto() != null) {
                Long motoId = motoristaDetails.getMoto().getId();
                if (motoId != null && motoId > 0) {
                    Optional<Moto> optionalMoto = motoRepository.findById(motoId);
                    if (optionalMoto.isPresent()) {
                        motorista.setMoto(optionalMoto.get());
                    } else {
                        return ResponseEntity.badRequest().body("{\"error\":\"Moto não encontrada\"}");
                    }
                } else {
                    // Se motoId é null ou 0, desassociar a moto
                    motorista.setMoto(null);
                }
            }
            // Se moto não foi enviada no request, manter a atual (não alterar)
            
            Motorista motoristaSalvo = motoristaRepository.save(motorista);
            return ResponseEntity.ok(DTOConverter.toDTO(motoristaSalvo));
        } catch (Exception e) {
            e.printStackTrace(); // Log do erro para debug
            return ResponseEntity.status(500).body("{\"error\":\"Erro ao atualizar motorista: " + e.getMessage() + "\"}");
        }
    }

    // DELETE - Deletar motorista
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMotorista(@PathVariable Long id) {
        Optional<Motorista> motorista = motoristaRepository.findById(id);
        
        if (motorista.isPresent()) {
            motoristaRepository.delete(motorista.get());
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.notFound().build();
    }

    // DELETE - Desassociar motorista da moto
    @DeleteMapping("/{motoristaId}/moto")
    public ResponseEntity<Motorista> desassociarMotoDoMotorista(@PathVariable Long motoristaId) {
        Optional<Motorista> optionalMotorista = motoristaRepository.findById(motoristaId);
        
        if (optionalMotorista.isPresent()) {
            Motorista motorista = optionalMotorista.get();
            motorista.setMoto(null);
            return ResponseEntity.ok(motoristaRepository.save(motorista));
        }
        
        return ResponseEntity.notFound().build();
    }
}
