document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const identifier = document.getElementById('identifier').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');
  const spinner = document.getElementById('spinner');

  errorMsg.textContent = '';
  successMsg.textContent = '';
  spinner.classList.remove('show');

  if (!identifier || !password) {
    errorMsg.textContent = 'Please fill in all fields';
    return;
  }

  spinner.classList.add('show');

  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: identifier,
        password: password
      })
    });

    const data = await response.json();
    spinner.classList.remove('show');

    if (response.ok) {
      successMsg.textContent = 'Login successful! Redirecting...';
      localStorage.setItem('donor_id', data.donor_id);
      localStorage.setItem('donor_name', data.donor_name);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      errorMsg.textContent = data.message || 'Login failed. Please try again.';
    }
  } catch (error) {
    spinner.classList.remove('show');
    errorMsg.textContent = 'Error connecting to server. Please try again.';
    console.error('Error:', error);
  }
});
