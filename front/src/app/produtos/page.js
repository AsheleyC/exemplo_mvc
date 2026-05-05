'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"


export default function CadastroProduto() {
    const [produtos, setProdutos] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    const [produtoId, setProdutoId] = useState('');
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [estoque, setEstoque] = useState('');
    const [categoria, setCategoria] = useState('');
    const [alerta, setAlerta] = useState(null);

    const API_URL = 'http://localhost:3001/produtos';

    // ================= CRUD =================//
    const handleSubmit = async (e) => {
        e.preventDefault();


        const payload = {
            nome,
            descricao,
            preco,
            estoque,
            categoria
        };

        const url = produtoId ? `${API_URL}/${produtoId}` : API_URL;
        const metodo = produtoId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            setAlerta({
                tipo: 'sucesso',
                titulo: 'Sucesso!',
                mensagem: 'Produto salvo com sucesso.'
            });
            limparFormulario();
        } else if (!response.ok) {
            const erro = await response.text();
            console.error(erro);
            alert('Erro ao salvar');
        }
    };

    const carregarProdutos = async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        setProdutos(data);
    };

    const editarProduto = async (id) => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const p = data.find(p => p.id === id);

        if (p) {
            setProdutoId(p.id);
            setNome(p.nome);
            setPreco(p.preco || '');
            setDescricao(p.descricao);
            setEstoque(p.estoque || '');
            setCategoria(p.categoria || '');
            fecharModal();
        }
    };

    const deletarProduto = async (id) => {
        if (!confirm('Excluir?')) return;
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        carregarProdutos();

        setAlerta({
            tipo: 'erro',
            titulo: 'Excluído!',
            mensagem: 'Produto removido com sucesso.'
        });

    };

    function limparFormulario() {
        setProdutoId('');
        setNome('');
        setDescricao('');
        setPreco('');
        setEstoque('');
        setCategoria('');
    }

    function abrirModal() {
        setModalAberto(true);
        carregarProdutos();
    }

    function fecharModal() {
        setModalAberto(false);
    }

    useEffect(() => {
        limparFormulario();
    }, []);

    useEffect(() => {
        if (alerta) {
            const timer = setTimeout(() => setAlerta(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [alerta]);

    return (
        <>
            <style jsx global>{`body { font-family: sans-serif; }`}</style>

            <div className="p-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Cadastro de Produto</h2>

                <div className="mb-[10px]">
                    <Button onClick={abrirModal}>
                        Pesquisar Cadastros
                    </Button>

                    <Button variant="secondary" onClick={limparFormulario}>
                        Novo Cadastro
                    </Button>
                </div>

                <hr className="mb-6" />

                {alerta && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <Alert className="animate-pulse w-[350px] shadow-lg border-2">
                            <AlertTitle>{alerta.titulo}</AlertTitle>
                            <AlertDescription>{alerta.mensagem}</AlertDescription>
                        </Alert>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input type="hidden" value={produtoId} onChange={(e) => setProdutoId(e.target.value)} />

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Nome</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
                    </div>

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Descricao</label>
                        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
                    </div>

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Preço</label>
                        <input type="text" value={preco} onChange={(e) => setPreco(e.target.value)} className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
                    </div>

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Estoque</label>
                        <input type="text" value={estoque} onChange={(e) => setEstoque(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
                    </div>

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Categoria</label>
                        <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
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
                                    <th className="border border-[#ccc] p-[8px] text-left">descricao</th>
                                    <th className="border border-[#ccc] p-[8px] text-left">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtos.map(p => (
                                    <tr key={p.id}>
                                        <td className="border border-[#ccc] p-[8px]">{p.id}</td>
                                        <td className="border border-[#ccc] p-[8px]">{p.nome}</td>
                                        <td className="border border-[#ccc] p-[8px]">{p.descricao}</td>
                                        <td className="border border-[#ccc] p-[8px]">
                                            <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded mr-[5px]" onClick={() => editarProduto(p.id)}>
                                                Editar
                                            </button>
                                            <button className="px-2 py-1 bg-red-500 text-white text-xs rounded" onClick={() => deletarProduto(p.id)}>
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