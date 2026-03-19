const pinataJwt = import.meta.env.VITE_PINATA_JWT;

export async function uploadToIpfs(file) {
  if (!pinataJwt) {
    throw new Error('Set VITE_PINATA_JWT to enable IPFS uploads.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pinataJwt}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('IPFS upload failed.');
  }

  const payload = await response.json();
  return payload.IpfsHash;
}
