'use client';

import { useState, useEffect } from 'react';

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

export default function CadastroProduto() {
    const [produtos, setProdutos] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    const [produtoId, setProdutoId] = useState('');
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [estoque, setEstoque] = useState('');
    const [categoria, setCategoria] = useState('');

    const API_URL = 'http://localhost:3000/produtos';

    // ================= CRUD =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            nome,
            descricao,
            preco: preco ? Number(preco) : null,
            estoque: estoque ? Number(estoque) : null,
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
            alert('Salvo!');
            limparFormulario();
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
            setDescricao(p.descricao || '');
            setPreco(p.preco || '');
            setEstoque(p.estoque || '');
            setCategoria(p.categoria || '');
            fecharModal();
        }
    };

    const deletarProduto = async (id) => {

        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        carregarProdutos();

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

    return (
        <>
            <style jsx global>{`body { font-family: sans-serif; }`}</style>

            <div className="p-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Cadastro de Produtos</h2>

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
                    <input type="hidden" value={produtoId} onChange={(e) => setProdutoId(e.target.value)} />

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Nome</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />

                    </div>

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Descrição</label>
                        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
                    </div>

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Preço</label>
                        <input type="number" value={preco} onChange={(e) => setPreco(e.target.value)} className="p-[5px] w-full max-w-[150px] border border-gray-300 rounded" />
                    </div>

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Estoque</label>
                        <input type="number" value={estoque} onChange={(e) => setEstoque(e.target.value)} className="p-[5px] w-full max-w-[150px] border border-gray-300 rounded" />
                    </div>

                    <div className="form-group mb-[10px]">
                        <label className="block font-bold text-[14px]">Categoria</label>
                        <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="p-[5px] w-full max-w-[300px] border border-gray-300 rounded" />
                    </div>


                    <Button type="submit" size="lg">Salvar</Button>
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
                                    <th className="border border-[#ccc] p-[8px] text-left">Nome</th>
                                    <th className="border border-[#ccc] p-[8px] text-left">Preço</th>
                                    <th className="border border-[#ccc] p-[8px] text-left">Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {produtos.map(p => (
                                    <tr key={p.id}>
                                        <td className="border border-[#ccc] p-[8px]">{p.id}</td>
                                        <td className="border border-[#ccc] p-[8px]">{p.nome}</td>
                                        <td className="border border-[#ccc] p-[8px]">{p.preco}</td>
                                        <td className="border border-[#ccc] p-[8px]">
                                            <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded mr-[5px]" onClick={() => editarProduto(p.id)}>
                                                Editar
                                            </button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                                                        Excluir
                                                    </button>
                                                </AlertDialogTrigger>

                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Essa ação não pode ser desfeita. Isso irá excluir o produto permanentemente.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>

                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>

                                                        <AlertDialogAction
                                                            onClick={() => deletarProduto(p.id)}
                                                        >
                                                            Confirmar exclusão
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

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