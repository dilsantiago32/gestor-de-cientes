// app.js

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCz87Gk4j9nf5em4PVBv0Mc7nDQHMSy3wI",
  authDomain: "gestor-de-clientes-6b90a.firebaseapp.com",
  projectId: "gestor-de-clientes-6b90a",
  storageBucket: "gestor-de-clientes-6b90a.appspot.com",
  messagingSenderId: "745007465511",
  appId: "1:745007465511:web:c404ba6d2fb00aeb8e7a02"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let usuarioAtual = null;
let idFormularioEditando = null;

// Firebase Auth
export async function loginUsuarioFirebase(email, senha) {
  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login realizado com sucesso!");
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
}

export async function criarUsuarioFirebase(email, senha) {
  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Conta criada com sucesso!");
  } catch (error) {
    alert("Erro ao criar conta: " + error.message);
  }
}

export async function logoutUsuario() {
  try {
    await signOut(auth);
    alert("Deslogado com sucesso!");
  } catch (error) {
    alert("Erro ao deslogar: " + error.message);
  }
}

export function onAuthStateChangedHandler(callback) {
  onAuthStateChanged(auth, (user) => {
    usuarioAtual = user;
    callback(user);
  });
}

// Firestore
export async function salvarFormularioNoFirestore(formulario, id = null) {
  if (!usuarioAtual) {
    alert("Você precisa estar logado para salvar formulários.");
    return;
  }
  try {
    const colecao = collection(db, "usuarios", usuarioAtual.uid, "dados");
    if (id) {
      const ref = doc(db, "usuarios", usuarioAtual.uid, "dados", id);
      await updateDoc(ref, formulario);
      alert("Formulário atualizado com sucesso!");
    } else {
      await addDoc(colecao, formulario);
      alert("Formulário salvo com sucesso!");
    }
    mostrarFormulariosUsuario();
  } catch (error) {
    alert("Erro ao salvar formulário: " + error.message);
  }
}

export async function mostrarFormulariosUsuario() {
  if (!usuarioAtual) {
    alert("Faça login para ver seus formulários.");
    return;
  }
  const colecao = collection(db, "usuarios", usuarioAtual.uid, "dados");
  const snapshot = await getDocs(colecao);
  const secao = document.getElementById("formularioSecao");
  secao.innerHTML = "";

  if (snapshot.empty) {
    secao.innerHTML = "<p>Nenhum formulário cadastrado.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "form-card";
    div.innerHTML = `
      <div class="info">
        <div class="nome">${data.nome}</div>
        <div class="valor">R$ ${parseFloat(data.valor).toFixed(2)}</div>
        <div class="data">${formatarData(data.data)}</div>
      </div>
      <div class="acoes">
        <button class="menu-btn" onclick="abrirPopupOpcoes(event, '${id}')">&#8942;</button>
      </div>
    `;
    secao.appendChild(div);
  });
}

window.abrirPopupOpcoes = function (event, id) {
  const popup = document.getElementById("popupOpcoes");
  popup.style.display = "flex";
  const rect = event.currentTarget.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY}px`;
  popup.style.left = `${rect.left + window.scrollX - 65}px`;
  popup.setAttribute("data-id", id);
};

window.editarFormulario = async function () {
  const id = document.getElementById("popupOpcoes").getAttribute("data-id");
  const ref = doc(db, "usuarios", usuarioAtual.uid, "dados", id);
  const docSnap = await getDoc(ref);
  if (!docSnap.exists()) return alert("Formulário não encontrado.");

  const dados = docSnap.data();
  document.getElementById("formNome").value = dados.nome;
  document.getElementById("formNomeCliente").value = dados.nomeCliente;
  document.getElementById("formData").value = dados.data;
  document.getElementById("formValor").value = dados.valor;
  document.getElementById("formTelefone").value = dados.telefone;
  document.getElementById("formWhatsapp").value = dados.whatsapp;
  document.getElementById("formInstagram").value = dados.instagram;
  document.getElementById("formObservacoes").value = dados.observacoes;

  idFormularioEditando = id;
  fecharPopup();
  mostrarModal("modalFormulario");
};

window.excluirFormulario = async function () {
  const id = document.getElementById("popupOpcoes").getAttribute("data-id");
  if (confirm("Tem certeza que deseja excluir este formulário?")) {
    await deleteDoc(doc(db, "usuarios", usuarioAtual.uid, "dados", id));
    alert("Formulário excluído com sucesso.");
    mostrarFormulariosUsuario();
  }
  fecharPopup();
};

function fecharPopup() {
  const popup = document.getElementById("popupOpcoes");
  popup.style.display = "none";
}

document.addEventListener("click", (event) => {
  const popup = document.getElementById("popupOpcoes");
  if (!popup.contains(event.target) && !event.target.classList.contains("menu-btn")) {
    fecharPopup();
  }
});

function formatarData(data) {
  if (!data) return "";
  const d = new Date(data);
  return d.toLocaleDateString();
}

// UI interações
function mostrarModal(id) {
  document.getElementById(id).style.display = 'flex';
}
function fecharModal(id) {
  document.getElementById(id).style.display = 'none';
}
function limparFormulario() {
  document.getElementById('formNome').value = '';
  document.getElementById('formNomeCliente').value = '';
  document.getElementById('formData').value = '';
  document.getElementById('formValor').value = '';
  document.getElementById('formTelefone').value = '';
  document.getElementById('formWhatsapp').value = '';
  document.getElementById('formInstagram').value = '';
  document.getElementById('formObservacoes').value = '';
  idFormularioEditando = null;
}

// Bind de eventos
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnEntrar').addEventListener('click', () => mostrarModal('modalLogin'));
  document.getElementById('btnCriarConta').addEventListener('click', () => mostrarModal('modalCadastro'));
  document.getElementById('btnLogout').addEventListener('click', logoutUsuario);
  document.getElementById('btnNovoFormulario').addEventListener('click', () => mostrarModal('modalFormulario'));
  document.getElementById('fecharFormulario').addEventListener('click', () => fecharModal('modalFormulario'));
  document.getElementById('fecharLogin').addEventListener('click', () => fecharModal('modalLogin'));
  document.getElementById('fecharCadastro').addEventListener('click', () => fecharModal('modalCadastro'));

  document.getElementById('btnLogin').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;
    await loginUsuarioFirebase(email, senha);
    fecharModal('modalLogin');
  });

  document.getElementById('btnCriar').addEventListener('click', async () => {
    const email = document.getElementById('cadastroEmail').value;
    const senha = document.getElementById('cadastroSenha').value;
    await criarUsuarioFirebase(email, senha);
    fecharModal('modalCadastro');
  });

  document.getElementById('btnSalvar').addEventListener('click', async () => {
    const formulario = {
      nome: document.getElementById('formNome').value,
      nomeCliente: document.getElementById('formNomeCliente').value,
      data: document.getElementById('formData').value,
      valor: parseFloat(document.getElementById('formValor').value || 0).toFixed(2),
      telefone: document.getElementById('formTelefone').value,
      whatsapp: document.getElementById('formWhatsapp').value,
      instagram: document.getElementById('formInstagram').value,
      observacoes: document.getElementById('formObservacoes').value
    };

    if (!formulario.nome || !formulario.data || !formulario.valor) {
      alert('Preencha ao menos Nome, Data e Valor.');
      return;
    }

    await salvarFormularioNoFirestore(formulario, idFormularioEditando);
    limparFormulario();
    fecharModal('modalFormulario');
  });

  document.getElementById('btnMeuBanco').addEventListener('click', mostrarFormulariosUsuario);
  document.getElementById('btnMaisProximos').addEventListener('click', mostrarFormulariosUsuario); // substitua depois
  document.getElementById('btnAcessarExterno').addEventListener('click', () => {
    const id = prompt('Digite o ID ou nome do banco externo para acessar:');
    if (id) buscarBancoExterno(id);
  });
});

// Estado de autenticação
onAuthStateChangedHandler((user) => {
  const logado = !!user;
  document.getElementById('usuarioLogado').style.display = logado ? 'flex' : 'none';
  document.getElementById('botoesBanco').style.display = logado ? 'block' : 'none';
  document.getElementById('secaoNovoFormulario').style.display = logado ? 'block' : 'none';
  document.getElementById('btnEntrar').style.display = logado ? 'none' : 'inline-block';
  document.getElementById('btnCriarConta').style.display = logado ? 'none' : 'inline-block';

  if (logado) {
    document.getElementById('nomeUsuario').innerText = user.email;
    mostrarFormulariosUsuario();
  }
});
