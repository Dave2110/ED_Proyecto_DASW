
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.role = 'alert';
    alertDiv.textContent = message;


    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.padding = '1rem';
    alertDiv.style.borderRadius = '4px';
    alertDiv.style.zIndex = '1000';

    if (type === 'error') {
        alertDiv.style.backgroundColor = '#f8d7da';
        alertDiv.style.color = '#721c24';
        alertDiv.style.border = '1px solid #f5c6cb';
    } else if (type === 'success') {
        alertDiv.style.backgroundColor = '#d4edda';
        alertDiv.style.color = '#155724';
        alertDiv.style.border = '1px solid #c3e6cb';
    }

    document.body.appendChild(alertDiv);


    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

//registro de inicio de sesión
document.getElementById('sign_up').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const email = document.getElementById('reg_correo').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/mongoo/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre,
                apellidos,
                email,
                password,
                role: 'user' 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Registro exitoso!', 'success');
            
            document.getElementById('sign_up').style.display = 'none';
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                location.reload();
            }
        } else {
            showAlert(data.message || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al conectar con el servidor');
    }
});


document.getElementById('log_modal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login_correo').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/mongoo/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            
            localStorage.setItem('token', data.token);
            
            if (data.role) {
                localStorage.setItem('userRole', data.role);
            }
            showAlert('Inicio de sesión exitoso!', 'success');
            
            document.getElementById('log_modal').style.display = 'none';
            
            location.reload();
        } else {
            showAlert(data.message || 'Error en el inicio de sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al conectar con el servidor');
    }
});


window.onclick = function(event) {
    const logModal = document.getElementById('log_modal');
    const regModal = document.getElementById('sign_up');

    if (event.target === logModal) {
        logModal.style.display = "none";
    }
    if (event.target === regModal) {
        regModal.style.display = "none";
    }
};


const modals = document.querySelectorAll('.modal');
modals.forEach(modal => {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
});
