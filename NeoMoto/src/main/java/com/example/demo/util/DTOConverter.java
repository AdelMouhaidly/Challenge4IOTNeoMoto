package com.example.demo.util;

import com.example.demo.entity.Motorista;
import com.example.demo.dto.MotoristaDTO;
import java.util.List;
import java.util.stream.Collectors;

public class DTOConverter {

    public static MotoristaDTO toDTO(Motorista motorista) {
        MotoristaDTO dto = new MotoristaDTO();
        dto.setId(motorista.getId());
        dto.setNome(motorista.getNome());
        dto.setCpf(motorista.getCpf());
        dto.setTelefone(motorista.getTelefone());
        dto.setEmail(motorista.getEmail());
        dto.setCnh(motorista.getCnh());
        dto.setEndereco(motorista.getEndereco());
        dto.setStatus(motorista.getStatus());
        
        try {
            if (motorista.getMoto() != null) {
                MotoristaDTO.MotoSimpleDTO motoDTO = new MotoristaDTO.MotoSimpleDTO();
                motoDTO.setId(motorista.getMoto().getId());
                motoDTO.setName(motorista.getMoto().getName());
                motoDTO.setMarca(motorista.getMoto().getMarca());
                dto.setMoto(motoDTO);
            }
        } catch (Exception e) {
            // Se houver erro ao acessar a moto (lazy loading), simplesmente não incluir
            dto.setMoto(null);
        }
        
        return dto;
    }

    public static List<MotoristaDTO> toDTOList(List<Motorista> motoristas) {
        return motoristas.stream()
                .map(DTOConverter::toDTO)
                .collect(Collectors.toList());
    }
}
