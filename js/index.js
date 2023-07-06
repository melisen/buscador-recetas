

///DOM:
const ingredientesSeleccionar = document.querySelector(".ingredientesSeleccionar");
const comensales = document.querySelector("#comensales");
const cantidadesReceta = document.querySelector(".cantidadesReceta");
const productosCarrito = document.querySelector(".productosCarrito");
const btnConfirmarCompra = document.querySelector("#btnConfirmarCompra");
const contenedorCarrito = document.getElementById('contenedorCarrito');
const tituloPrecioTotal = document.getElementById('tituloPrecioTotal');
const precioTotal = document.getElementById('precioTotal');
const tabla = document.getElementById('tabla');



const arrayIngredientes = [];
function recuperarIngredientes(){
fetch("../json-local/ingredientes.json")
                        .then( (respuesta) => respuesta.json() )
                        .then( (data) => {
                            data.forEach(element =>{
                                element.pesoNeto1Porcion=parseInt(element.pesoNeto1Porcion);
                                element.factorCorreccion=parseInt(element.factorCorreccion);
                                element.GramosEnBolsa=parseInt(element.GramosEnBolsa);
                                element.precioXBolsa=parseInt(element.precioXBolsa);


                                arrayIngredientes.push(element);

                            })
                            mostrarIngred(arrayIngredientes);
                            quePasaCuandoCheck(arrayIngredientes);
                        
                        });
                        
}
recuperarIngredientes();

//Rellenar select comensales:
for(let i = 1; i<13; i++){
    let opcion = document.createElement("option");
    opcion.value = i;
    opcion.innerText=i;
    comensales.appendChild(opcion);
}

//App:

let cantPorciones;
comensales.addEventListener("change",() =>{
    cantPorciones = comensales.value;
    localStorage.setItem('cantPorciones', JSON.stringify(cantPorciones));
    //Es relevante llamar la atención al usuario sobre la importancia de completar este paso para poder seguir con el resto del proceso (brindar el dato para poder calcular cantidades). Se una un toast ya que no es necesario interrumpir el flujo de acciones del usuario (como sería por ejemplo con un alert).
    Toastify({
        avatar: "../images/oryza-logo.png",
        text: "Seleccionaste la cantidad de comensales, ¡Genial!",
        gravity: "top",
        position: "right",
        style:{
            background: "rgba(65, 44, 16, 0.897)"
        }
    }).showToast();      
    
});


//seleccion ingredientes:
const mostrarIngred = (arrayIngredientes) =>{
    arrayIngredientes.forEach((e) =>{
        const cardIngredSelec = document.createElement("div");
        cardIngredSelec.className ="cardIngredSelec";
        ingredientesSeleccionar.appendChild(cardIngredSelec);
        cardIngredSelec.innerHTML =    
        `<div class="card-seleccionar ">
            <img    src="${e.foto}"
                    class=" card-img-top img-fluid"
                    alt="${e.nombreIngred}"/>
            <br>
            <label  for="${e.nombreIngred}">${e.nombreIngred}</label>
            <input type="checkbox" class="checkboxCuadrado"  id="checkbox${e.id}" value="1"><br>
        </div>`
        
    })
}


const ingredEnStock = [];
function agregarMasa(){
    fetch("../json-local/ingredientes-masa.json")
                            .then( (respuesta) => respuesta.json() )
                            .then( (data) => {
                                data.forEach(element =>{
                                    ingredEnStock.push(element);
                                })
                            });                            
    }

agregarMasa();

function agregarAingredEnStock(arrayIng, id){
    ingredEnStock.push(arrayIng.find((e) => e.id == id));
    localStorage.setItem('pizza', JSON.stringify(ingredEnStock))
}

function quePasaCuandoCheck(arrayIng){
   arrayIng.forEach((e) =>{
        const elegido = document.getElementById(`checkbox${e.id}`);
        elegido.addEventListener('click',()=>{ 
            elegido.value!==null && agregarAingredEnStock(arrayIng, e.id);
            localStorage.setItem("ingredElegidoID",JSON.stringify(e.id))
            //Se inserta un toast para enfatizar que la acción de agregar un ingrediente por parte del usuario es importante para el proceso general de armar la pizza.
            Toastify({
                avatar: "../images/oryza-logo.png",
                text: "¡Agregaste un nuevo ingrediente!",
                gravity: "bottom",
                position: "right",
                style:{
                    background: "rgba(65, 44, 16, 0.897)"
                }
            }).showToast();       
        })
    })
}




//Completa selección de ingredientes. Validación: que haya seleccionado la cantidad de comensales, de lo contrario sale un sweetalert.
function alertComensales(){
        swal.fire({
        title: "Te faltó decirnos para cuántos cocinarás",
        text: "Para poder calcular las cantidades de tu receta",
        confirmButtonText:"Ok",
        confirmButtonColor: "#1b8f72",
        backdrop: `
        rgba(31,95,79,0.37)
        url("../images/cuantos-cocinaras.png")
        top
        no-repeat
    `
    })
}

//' confirmacionSelecIngred desencadena procesos en paralelo: 
//*buscar una receta que contenga al menos la mitad de los ingredientes: falta hacer función
//' mostrar las cantidades de todos los ingred para la receta teniendo en cuenta cantPorciones: modificar mostrarCantidadesReceta 
//*mostrar el procedimiento:  falta hacer función
//*diferenciar los productos que no están en stock: falta hacer función
//' mostrar los productos agregados automáticamente a la lista de compras: modificar mostrarProductos

document.querySelector("#spinner").style.display = "none";

function confirmacionSelecIngred(){
    document.querySelector('#yaTermine').addEventListener("click", () =>{
        document.querySelector("#spinner").style.display = "inline-block";
        const promesa = new Promise ((resolve, reject) => {
            if(comensales.value==0){
                setTimeout(() => {
                    
                    resolve();
                },2000);
            }else{
                setTimeout(() => {
                    reject();
                },2000);
            }
        });
        promesa
        .then(() => {
            alertComensales()
        })
        .catch(() => {
            mostrarCantidadesReceta(ingredEnStock);
            mostrarProductos(ingredEnStock);
        })
        .finally(() => {
            document.querySelector("#spinner").style.display = "none";
            document.querySelector("#cantidadesNecesarias").innerHTML = `Cantidades necesarias:`;
            document.querySelector("#carrito").innerHTML = ` Hemos agregado los artículos necesarios a tu carrito: <br><span>Puedes agregar o quitar los que necesites</span>`;
        });    
    })
}



//Calcular cantidades de la receta con el método, dentro de cada card de ingrediente:
function mostrarCantidadesReceta (arrayReceta){
    cantidadesReceta.innerHTML = "";
    arrayReceta.forEach(ingred => {
    const cajaCantidadesReceta = document.createElement("div");
    cajaCantidadesReceta.className ="cajaCantidadesReceta";
    cantidadesReceta.appendChild(cajaCantidadesReceta);
    cajaCantidadesReceta.innerHTML= 
        `<div class="card-body-receta">
            <img    src="${ingred.foto}"
                    class=" card-img-top img-fluid"
                    alt="${ingred.nombreIngred}"/>
            <h4>${ingred.nombreIngred.toUpperCase()}</h4>
            <h4>${cantPorciones*ingred.pesoNeto1Porcion}g</h4> 
        </div>`;
    })
    localStorage.setItem("listaCantidadesReceta", JSON.stringify(arrayReceta))
}

//Mostrar cards en la sección de productos carrito, cada card contiene datos del ingrediente, cantidad de unidades de compra necesarias, su precio unitario y el subtotal
function mostrarProductos(arrayProductos){
    arrayProductos = arrayProductos.filter(item => item.id !== 15);
    productosCarrito.innerHTML="";
    arrayProductos.forEach(producto =>{
        //Declaración de propiedad cantidad:
        producto.cantidad = Math.ceil(((producto.pesoNeto1Porcion*producto.factorCorreccion)*cantPorciones)/producto.GramosEnBolsa);
        //Creación de cards:
    const divCaja = document.createElement("div");
    divCaja.className ="caja";
    productosCarrito.appendChild(divCaja);
    divCaja.innerHTML = 
    `<div class=" card-carrito">

        <img    src="${producto.fotoProducto}"
                class="fotoProducto"
                alt="${producto.nombreIngred}"/>
        <h4>${producto.nombreIngred.toUpperCase()}</h4>
        <h4>${producto.marca}</h4>
        <h4>Contenido: ${producto.GramosEnBolsa}g</h4>
        <h4>$ ${producto.precioXBolsa} c/u</h4>
        <h4 id="cant${producto.id}"> Cantidad:${producto.cantidad}</h4>   
        <button type="button" id="agregar${producto.id}" class="btn btn-outline-secondary"> + </button> <button type="button" id="eliminar${producto.id}" class="btn btn-outline-secondary"> - </button>
        <h3 id="subtotal${producto.id}"> Subtotal: $ ${producto.cantidad*producto.precioXBolsa}</h3>
    </div>`;

        //Agregar y eliminar unidades de las cards de los productos: Va cambiando la propiedad cantidad de los objetos.
        let btnAgregar = document.getElementById(`agregar${producto.id}`);
        btnAgregar.addEventListener('click',()=>{
            producto.cantidad += 1;
            document.getElementById(`cant${producto.id}`).innerText =`Cantidad: ${producto.cantidad}`;
            document.getElementById(`subtotal${producto.id}`).innerText =`Subtotal: $ ${producto.cantidad*producto.precioXBolsa}`;
            localStorage.setItem('pizza', JSON.stringify(ingredEnStock))
        })
        
        let btnEliminar = document.getElementById(`eliminar${producto.id}`);
        btnEliminar.addEventListener('click',()=>{
            if(producto.cantidad == 1){
                    // Paramos el envio del formulario submit
                    //producto.preventDefault();
                    //alert 
                    swal.fire({
                        title: `¿Quieres eliminar este producto ${producto.nombreIngred}?`,
                        icon: "warning",
                        text:  `${producto.nombreIngred} será quitado del carrito.`,
                        showCancelButton: true,
                        confirmButtonText: "Sí, quiero quitarlo",
                        confirmButtonColor: "#1b8f72",
                        cancelButtonText: "No, no quiero quitarlo",
                        cancelButtonColor: "#aa8d67cc"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            //borrar card del carrito:
                            btnEliminar.parentElement.remove()
                            //buscamos en el localstorage
                            ingredEnStock = ingredEnStock.filter(item => item.id != producto.id)
                            localStorage.setItem('pizza', JSON.stringify(ingredEnStock))
                        }
                    });
            } else{
                    producto.cantidad -= 1;
                    //Actualizao cantidad y subtotal en las cards:
                    document.getElementById(`cant${producto.id}`).innerText =`Cantidad: ${producto.cantidad}`;
                    document.getElementById(`subtotal${producto.id}`).innerText =`Subtotal: $ ${producto.cantidad*producto.precioXBolsa}`;
                    localStorage.setItem('pizza', JSON.stringify(ingredEnStock));       
            }
        })
    })       

    comprar();

}

//Confirmación de compra: muestra lista final de productos y la suma.
function comprar(){
    btnConfirmarCompra.style.display="flex";
    btnConfirmarCompra.addEventListener("click", () =>{
        mostrarCarritoFinal();
    })
}

let carritoFinal;
function mostrarCarritoFinal() {
    contenedorCarrito.innerHTML = "";

    tabla.style.display = "table";
 

    ingredEnStock.splice(1,1)
    ingredEnStock.forEach(el => {
        const productoEnCarrito = document.createElement('tr');
        productoEnCarrito.className = 'productoEnCarrito';
        productoEnCarrito.innerHTML=`
        <td>${el.nombreIngred.toUpperCase()}</td>
        <td>${el.marca}</td>
        <td>${el.GramosEnBolsa}  g</td>
        <td>$${el.precioXBolsa} </td>
        <td>${el.cantidad}</td> `;                        
        contenedorCarrito.appendChild(productoEnCarrito);
    })
    localStorage.setItem("ingredEnStockFinal", JSON.stringify(ingredEnStock));

    calcularTotal();
    document.querySelector("#btnRealizarPedido").style.display = "block";
}

////Calcular total:
const calcularTotal = () =>{
    // método reduce() para hacer una sumatoria, devuelve el resutado que lo guardamos en una variable total. El último parámetro, que está en 0, es desde dónde va a empezar a sumar
    let total = ingredEnStock.reduce((acc, elemento) => acc + (elemento.cantidad*elemento.precioXBolsa), 0);
    precioTotal.innerHTML =`<h2 class="col-10" id="tituloPT" > Total del pedido: <br> $ ${total} </h2> `;
    
    localStorage.setItem("total", JSON.stringify(total));
}

function recuperar() {
    let recuperarLS = JSON.parse(localStorage.getItem('pizza'))
    if(recuperarLS){
        recuperarLS.forEach(el=> {
            el.pesoNeto1Porcion=parseInt(element.pesoNeto1Porcion);
            el.factorCorreccion=parseInt(el.factorCorreccion);
            el.GramosEnBolsa=parseInt(el.GramosEnBolsa);
            el.precioXBolsa=parseInt(el.precioXBolsa);
            mostrarCantidadesReceta(recuperarLS);
            mostrarProductos(recuperarLS);
            ingredEnStock.push(el)
            mostrarCarritoFinal()
        })
    }
}

////////Llamo funciones:

confirmacionSelecIngred();
recuperar();

