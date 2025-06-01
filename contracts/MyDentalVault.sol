// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MyDentalVault - Contrato mínimo para verificación y control de acceso
/// @author CriptoUNAM
/// @notice Solo almacena roles, permisos y referencias (hashes IPFS) mediante eventos

contract MyDentalVault {
    enum Role { None, Paciente, Dentista }

    mapping(address => Role) public roles;
    mapping(address => mapping(address => bool)) public permisos; // paciente => dentista => acceso

    event PacienteRegistrado(address indexed paciente);
    event DentistaRegistrado(address indexed dentista);
    event AccesoOtorgado(address indexed paciente, address indexed dentista);
    event AccesoRevocado(address indexed paciente, address indexed dentista);
    event DocumentoReferenciado(address indexed paciente, address indexed dentista, bytes32 ipfsHash, uint256 timestamp);

    // Registro de usuarios
    function registrarPaciente() external {
        require(roles[msg.sender] == Role.None, "Ya registrado");
        roles[msg.sender] = Role.Paciente;
        emit PacienteRegistrado(msg.sender);
    }
    function registrarDentista() external {
        require(roles[msg.sender] == Role.None, "Ya registrado");
        roles[msg.sender] = Role.Dentista;
        emit DentistaRegistrado(msg.sender);
    }

    // Permisos
    function otorgarAcceso(address dentista) external {
        require(roles[msg.sender] == Role.Paciente, "Solo paciente");
        require(roles[dentista] == Role.Dentista, "No es dentista");
        permisos[msg.sender][dentista] = true;
        emit AccesoOtorgado(msg.sender, dentista);
    }
    function revocarAcceso(address dentista) external {
        require(roles[msg.sender] == Role.Paciente, "Solo paciente");
        permisos[msg.sender][dentista] = false;
        emit AccesoRevocado(msg.sender, dentista);
    }
    function tieneAcceso(address paciente, address dentista) public view returns (bool) {
        return permisos[paciente][dentista];
    }

    // Referenciar documentos (solo hash)
    modifier soloDentistaConPermiso(address paciente) {
        require(roles[msg.sender] == Role.Dentista, "Solo dentista");
        require(permisos[paciente][msg.sender], "Sin permiso del paciente");
        _;
    }
    function referenciarDocumento(address paciente, bytes32 ipfsHash) external soloDentistaConPermiso(paciente) {
        emit DocumentoReferenciado(paciente, msg.sender, ipfsHash, block.timestamp);
    }

    // Utilidad
    function miRol() external view returns (Role) {
        return roles[msg.sender];
    }
} 