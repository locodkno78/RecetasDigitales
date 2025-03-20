import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzCN_69meoMTP9mAL4yDJcXFVEA3Pq0dA",
  authDomain: "clientes-26237.firebaseapp.com",
  databaseURL: "https://clientes-26237-default-rtdb.firebaseio.com",
  projectId: "clientes-26237",
  storageBucket: "clientes-26237.appspot.com",
  messagingSenderId: "320420249976",
  appId: "1:320420249976:web:d2962562d9377241abc88d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const obtenerPedidos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'recetas'));
    const pedidos = [];

    querySnapshot.forEach((doc) => {
      pedidos.push({ id: doc.id, ...doc.data() });
    });
    return pedidos;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

// Función para actualizar el estado del pedido en la base de datos
export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {  
  try {
    const pedidoDocRef = doc(db, 'recetas', pedidoId);
    await updateDoc(pedidoDocRef, { 'estado': nuevoEstado });    
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    throw error;
  }
};

export const deletePedido = async (pedidoId) => {
  try {
    const pedidoRef = doc(db, 'recetas', pedidoId);
    await deleteDoc(pedidoRef);
  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
    throw error;
  }
};

export const getRecetas = async () => {
  const querySnapshot = await getDocs(collection(db, 'recetas'));
  return querySnapshot;
};

export const obtenerConsultas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'consultas'));
    const consultas = [];

    querySnapshot.forEach((doc) => {
      consultas.push({ id: doc.id, ...doc.data() });
    });
    return consultas;
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

// Función para actualizar el estado del pedido en la base de datos
export const actualizarEstadoConsulta = async (consultaId, nuevoEstado) => {  
  try {
    const consultaDocRef = doc(db, 'consultas', consultaId);
    await updateDoc(consultaDocRef, { 'estado': nuevoEstado });    
  } catch (error) {
    console.error('Error al actualizar el estado de la consulta:', error);
    throw error;
  }
};

export const deleteConsulta = async (consultaId) => {
  try {
    const consultaRef = doc(db, 'consultas', consultaId);
    await deleteDoc(consultaRef);
  } catch (error) {
    console.error("Error al eliminar la consulta:", error);
    throw error;
  }
};

export const getConsultas = async () => {
  const querySnapshot = await getDocs(collection(db, 'consultas'));
  return querySnapshot;
};


export { db, auth };