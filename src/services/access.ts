import { ethers } from 'ethers';

interface AccessSignature {
  dentistAddress: string;
  patientAddress: string;
  expiresAt: number;
  signature: string;
}

export const generateAccessMessage = (
  dentistAddress: string,
  patientAddress: string,
  expiresAt: number
): string => {
  return `MyDentalVault Access Grant\nDentist: ${dentistAddress}\nPatient: ${patientAddress}\nExpires: ${expiresAt}`;
};

export const signAccessGrant = async (
  provider: ethers.providers.Web3Provider,
  patientAddress: string,
  dentistAddress: string,
  days: number
): Promise<AccessSignature> => {
  const signer = provider.getSigner();
  const expiresAt = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);
  
  const message = generateAccessMessage(dentistAddress, patientAddress, expiresAt);
  const signature = await signer.signMessage(message);

  return {
    dentistAddress,
    patientAddress,
    expiresAt,
    signature
  };
};

export const verifyAccessGrant = async (
  signature: AccessSignature
): Promise<boolean> => {
  const message = generateAccessMessage(
    signature.dentistAddress,
    signature.patientAddress,
    signature.expiresAt
  );

  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature.signature);
    return recoveredAddress.toLowerCase() === signature.patientAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

export const isAccessValid = (signature: AccessSignature): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return signature.expiresAt > currentTime;
}; 
 