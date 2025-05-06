import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useValidate2FAMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';

const AdminLoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // 2FA states
  const [twoFactorData, setTwoFactorData] = useState({
    token: '',
    userId: '',
    useBackupCode: false
  });
  
  // UI states
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  
  // RTK Query hooks
  const [login, { isLoading }] = useLoginMutation();
  const [validate2FA, { isLoading: isValidating }] = useValidate2FAMutation();
  
  // Check if account is locked
  useEffect(() => {
    const lockedUntil = localStorage.getItem('adminLoginLocked');
    if (lockedUntil) {
      const lockTimeMs = parseInt(lockedUntil, 10);
      if (lockTimeMs > Date.now()) {
        setIsLocked(true);
        setLockTime(Math.ceil((lockTimeMs - Date.now()) / 1000));
        
        // Set timer to count down lock time
        const interval = setInterval(() => {
          setLockTime(prevTime => {
            if (prevTime <= 1) {
              clearInterval(interval);
              setIsLocked(false);
              localStorage.removeItem('adminLoginLocked');
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        localStorage.removeItem('adminLoginLocked');
      }
    }
    
    // Check previous attempts
    const attempts = localStorage.getItem('adminLoginAttempts');
    if (attempts) {
      setLoginAttempts(parseInt(attempts, 10));
    }
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle 2FA form input changes
  const handleTwoFactorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTwoFactorData({
      ...twoFactorData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Validate login form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email é inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate 2FA form
  const validateTwoFactorForm = () => {
    const newErrors = {};
    
    if (!twoFactorData.token) {
      newErrors.token = 'Código é obrigatório';
    } else if (!twoFactorData.useBackupCode && !/^\d{6}$/.test(twoFactorData.token)) {
      newErrors.token = 'O código deve ter 6 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle login attempt failures
  const handleLoginFailure = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('adminLoginAttempts', newAttempts);
    
    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      const lockDuration = 5 * 60 * 1000; // 5 minutes
      const unlockTime = Date.now() + lockDuration;
      localStorage.setItem('adminLoginLocked', unlockTime.toString());
      setIsLocked(true);
      setLockTime(lockDuration / 1000);
    }
  };
  
  // Handle login success
  const handleLoginSuccess = (userData, token) => {
    // Clear failed attempts on success
    localStorage.removeItem('adminLoginAttempts');
    setLoginAttempts(0);
    
    // Set auth credentials
    dispatch(setCredentials({
      user: userData,
      token: token
    }));
    
    // Redirect to intended page or admin dashboard
    const from = location.state?.from || '/admin';
    navigate(from, { replace: true });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    if (!showTwoFactor) {
      // First step - normal login
      if (!validateForm()) return;
      
      try {
        const result = await login({
          ...formData,
          isAdmin: true // Special flag for admin login
        }).unwrap();
        
        if (result.data.requireTwoFactor) {
          // User has 2FA enabled
          setTwoFactorData({
            ...twoFactorData,
            userId: result.data.userId
          });
          setShowTwoFactor(true);
        } else {
          // Check if user has admin role
          if (!result.data.user.role || result.data.user.role !== 'admin') {
            setErrors({ form: 'Acesso administrativo negado. Entre em contato com o suporte.' });
            handleLoginFailure();
            return;
          }
          
          // Login completed
          handleLoginSuccess(result.data.user, result.data.accessToken);
        }
      } catch (err) {
        if (err.data?.error?.message) {
          setErrors({ form: err.data.error.message });
        } else {
          setErrors({ form: 'Falha no login. Verifique suas credenciais e tente novamente.' });
        }
        handleLoginFailure();
        console.error('Login failed:', err);
      }
    } else {
      // Second step - 2FA validation
      if (!validateTwoFactorForm()) return;
      
      try {
        const result = await validate2FA({
          ...twoFactorData,
          isAdmin: true // Special flag for admin 2FA
        }).unwrap();
        
        // Check if user has admin role
        if (!result.data.user.role || result.data.user.role !== 'admin') {
          setErrors({ form: 'Acesso administrativo negado. Entre em contato com o suporte.' });
          handleLoginFailure();
          return;
        }
        
        // 2FA validation completed
        handleLoginSuccess(result.data.user, result.data.accessToken);
      } catch (err) {
        if (err.data?.error?.message) {
          setErrors({ token: err.data.error.message });
        } else {
          setErrors({ token: 'Código inválido. Tente novamente.' });
        }
        handleLoginFailure();
        console.error('2FA validation failed:', err);
      }
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-sm-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-0">AliTools Admin</h2>
                <p className="text-muted">Acesso restrito a administradores</p>
              </div>
              
              {isLocked ? (
                <Alert variant="danger">
                  <Alert.Heading>Conta Temporariamente Bloqueada</Alert.Heading>
                  <p>
                    Devido a múltiplas tentativas de login mal-sucedidas, o acesso a esta conta foi
                    temporariamente bloqueado por motivos de segurança.
                  </p>
                  <p className="mb-0">
                    Por favor, aguarde <strong>{Math.floor(lockTime / 60)}:{(lockTime % 60).toString().padStart(2, '0')}</strong> antes de tentar novamente ou contacte o suporte.
                  </p>
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  {errors.form && (
                    <Alert variant="danger">{errors.form}</Alert>
                  )}
                  
                  {!showTwoFactor ? (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="nome@alitools.com.br"
                          value={formData.email}
                          onChange={handleChange}
                          isInvalid={!!errors.email}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Senha</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Digite sua senha"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          name="rememberMe"
                          label="Lembrar-me"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </>
                  ) : (
                    <Form.Group className="mb-3">
                      <Form.Label>Código de Verificação</Form.Label>
                      <Form.Control
                        type="text"
                        name="token"
                        placeholder={twoFactorData.useBackupCode ? "Digite o código de backup" : "Digite o código de 6 dígitos"}
                        value={twoFactorData.token}
                        onChange={handleTwoFactorChange}
                        isInvalid={!!errors.token}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.token}
                      </Form.Control.Feedback>
                      <Form.Check
                        type="checkbox"
                        className="mt-2"
                        name="useBackupCode"
                        label="Usar código de backup"
                        checked={twoFactorData.useBackupCode}
                        onChange={handleTwoFactorChange}
                      />
                    </Form.Group>
                  )}
                  
                  <div className="d-grid gap-2 mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading || isValidating}
                    >
                      {isLoading || isValidating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processando...
                        </>
                      ) : showTwoFactor ? (
                        'Verificar'
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </div>
                  
                  {showTwoFactor && (
                    <div className="text-center mt-3">
                      <Button
                        variant="link"
                        type="button"
                        onClick={() => setShowTwoFactor(false)}
                        className="text-decoration-none"
                      >
                        <i className="bi bi-arrow-left me-1"></i> Voltar
                      </Button>
                    </div>
                  )}
                  
                  {!showTwoFactor && loginAttempts > 0 && (
                    <Alert variant="warning" className="mt-3 mb-0">
                      <p className="mb-0">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {5 - loginAttempts} tentativas restantes antes do bloqueio temporário.
                      </p>
                    </Alert>
                  )}
                </Form>
              )}
            </Card.Body>
          </Card>
          
          <div className="text-center mt-3">
            <Link to="/" className="text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i> Voltar para a página inicial
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLoginPage; 