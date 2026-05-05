'use client';

import { useState, useRef, useEffect } from 'react';

export default function CadastroPessoa() {
  const [pessoas, setPessoas] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [emailErrorVisible, setEmailErrorVisible] = useState(false);
  const [pessoaId, setPessoaId] = useState('');
  const [documento, setDocumento] = useState('');
  const [cep, setCep] = useState('');
  const [email, setEmail] = useState('');
  const [nomeRazaoSocial, setNomeRazaoSocial] = useState('');
  const [nomeSocialFantasia, setNomeSocialFantasia] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  const formRef = useRef(null);
  const numeroRef = useRef(null);

  const API_URL = 'http://localhost:3001/pessoas';

  // ================= VALIDAÇÕES =================
  function validarEmail(emailStr) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  }

  function validarCPF(cpf) {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }

  function validarCNPJ(cnpj) {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0, pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;

    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;

    return true;
  }

  function validarDocumento(docLimpo) {
    if (docLimpo.length === 11) return validarCPF(docLimpo);
    if (docLimpo.length === 14) return validarCNPJ(docLimpo);
    return false;
  }

  // ================= MÁSCARAS =================
  const handleDocumentoInput = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      valor = valor.replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    setDocumento(valor);
  };

  const handleCepInput = async (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    setCep(valor);

    const cepLimpo = valor.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEndereco(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
          numeroRef.current?.focus();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEmailBlur = (e) => {
    const isInvalid = (!validarEmail(e.target.value) && e.target.value !== "");
    setEmailErrorVisible(isInvalid);
  };

  // ================= CRUD =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarEmail(email)) return alert("E-mail inválido");

    const docLimpo = documento.replace(/\D/g, "");
    if (!validarDocumento(docLimpo)) return alert("Documento inválido");

    const payload = {
      documento: docLimpo,
      tipo: docLimpo.length > 11 ? 'CNPJ' : 'CPF',
      nome_razao_social: nomeRazaoSocial,
      nome_social_fantasia: nomeSocialFantasia,
      cep: cep.replace(/\D/g, ""),
      endereco,
      numero,
      bairro,
      cidade,
      estado,
      email
    };

    const url = pessoaId ? `${API_URL}/${pessoaId}` : API_URL;
    const metodo = pessoaId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('Salvo!');
      limparFormulario();
    }
  };

  const carregarPessoas = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setPessoas(data);
  };

  const editarPessoa = async (id) => {
    const res = await fetch(API_URL);
    const data = await res.json();
    const p = data.find(p => p.id === id);

    if (p) {
      setPessoaId(p.id);
      setNomeRazaoSocial(p.nome_razao_social);
      setNomeSocialFantasia(p.nome_social_fantasia || '');
      setEndereco(p.endereco || '');
      setNumero(p.numero || '');
      setBairro(p.bairro || '');
      setCidade(p.cidade || '');
      setEstado(p.estado || '');
      setEmail(p.email || '');
      setDocumento(p.documento);
      setCep(p.cep || '');
      fecharModal();
    }
  };

  const deletarPessoa = async (id) => {
    if (!confirm('Excluir?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    carregarPessoas();
  };

  function limparFormulario() {
    setPessoaId('');
    setDocumento('');
    setCep('');
    setEmail('');
    setNomeRazaoSocial('');
    setNomeSocialFantasia('');
    setEndereco('');
    setNumero('');
    setBairro('');
    setCidade('');
    setEstado('');
    setEmailErrorVisible(false);
  }

  function abrirModal() {
    setModalAberto(true);
    carregarPessoas();
  }

  function fecharModal() {
    setModalAberto(false);
  }

  useEffect(() => {
    limparFormulario();
  }, []);

  return (
    <>
      <style jsx global>{`body { font-family: sans-serif; }`}</style>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Cadastro de Pessoa</h2>

        <div className="mb-[10px]">
          <button type="button" onClick={abrirModal} className="mr-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Pesquisar Cadastros
          </button>
          <button type="button" onClick={limparFormulario} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Novo Cadastro
          </button>
        </div>

        <hr className="mb-6" />

        <form onSubmit={handleSubmit}>
          <input type="hidden" value={pessoaId} onChange={(e) => setPessoaId(e.target.value)} />

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">CPF ou CNPJ</label>
            <input type="text" value={documento} onChange={handleDocumentoInput} maxLength={18} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">Nome ou Razão Social</label>
            <input type="text" value={nomeRazaoSocial} onChange={(e) => setNomeRazaoSocial(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">Nome Social ou Nome Fantasia</label>
            <input type="text"  value={nomeSocialFantasia} onChange={(e) => setNomeSocialFantasia(e.target.value)} className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">CEP</label>
            <input type="text" value={cep} onChange={handleCepInput} maxLength={9} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">Endereço</label>
            <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">Número</label>
            <input ref={numeroRef} type="text" value={numero} onChange={(e) => setNumero(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">Bairro</label>
            <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">Cidade</label>
            <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">Estado</label>
            <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
          </div>

          <div className="form-group mb-[10px]">
            <label className="block font-bold text-[14px]">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={handleEmailBlur} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
            <span className={`text-red-500 text-[12px] ${emailErrorVisible ? 'block' : 'hidden'}`}>
              E-mail inválido
            </span>
          </div>

          <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Salvar
          </button>
        </form>

        <div className={`fixed inset-0 z-50 ${modalAberto ? 'block' : 'hidden'}`} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" style={{ background: '#fff', margin: '5% auto', padding: '20px', width: '90%', maxWidth: '800px', borderRadius: '5px' }}>
            <span className="btn-fechar float-right cursor-pointer text-red-500 font-bold" onClick={fecharModal}>
              X Fechar
            </span>

            <h3 className="text-xl font-bold mb-[15px]">Registros</h3>

            <table className="w-full border-collapse" style={{ marginTop: '15px' }}>
              <thead>
                <tr>
                  <th className="border border-[#ccc] p-[8px] text-left">ID</th>
                  <th className="border border-[#ccc] p-[8px] text-left">Nome/Razão</th>
                  <th className="border border-[#ccc] p-[8px] text-left">Documento</th>
                  <th className="border border-[#ccc] p-[8px] text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pessoas.map(p => (
                  <tr key={p.id}>
                    <td className="border border-[#ccc] p-[8px]">{p.id}</td>
                    <td className="border border-[#ccc] p-[8px]">{p.nome_razao_social}</td>
                    <td className="border border-[#ccc] p-[8px]">{p.documento}</td>
                    <td className="border border-[#ccc] p-[8px]">
                      <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded mr-[5px]" onClick={() => editarPessoa(p.id)}>
                        Editar
                      </button>
                      <button className="px-2 py-1 bg-red-500 text-white text-xs rounded" onClick={() => deletarPessoa(p.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}