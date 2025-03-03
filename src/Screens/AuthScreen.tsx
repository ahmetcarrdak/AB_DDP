import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

interface AuthFormData {
  taxNumber?: string;
  tcNumber?: string;
  password: string;
  email?: string;
  companyName?: string;
}

const AuthScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isCompanyLogin, setIsCompanyLogin] = useState(true);
  const navigate = useNavigate();
  const { login, setIsAuthenticated } = useAuth();

  const onFinish = async (values: AuthFormData) => {
    setLoading(true);
    try {
        let endpoint;
        if (isLogin) {
            endpoint = isCompanyLogin ? 'http://localhost:5262/api/Auth/company/login' : '/api/auth/personnel/login';
        } else {
            endpoint = '/api/auth/company/register';
        }

        const response = await axios.post(endpoint, values);
        if (response.data.token) {
            const userData = {
                type: isCompanyLogin ? 'company' : 'personnel',
                ...response.data.user
            };

            login(response.data.token, userData);
            
            toast.success(isLogin ? 'Giriş başarılı!' : 'Kayıt başarılı!');
            
            // Kullanıcı giriş yaptıysa dashboard'a yönlendir
            navigate('/', { replace: true });
        }
    } catch (error) {
        console.error('Login error:', error);
        toast.error(isLogin ? 'Giriş bilgileri hatalı!' : 'Kayıt işlemi başarısız!');
    } finally {
        setLoading(false);
    }
};


  const CompanyLoginForm = () => (
    <Form
      name="company_login"
      className="auth-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      <Form.Item
        name="taxNumber"
        rules={[{ required: true, message: 'Lütfen vergi numaranızı girin!' }]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Vergi Numarası"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Şifre"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          size="large"
          block
        >
          Giriş Yap
        </Button>
      </Form.Item>
      {isCompanyLogin && (
        <Button type="link" onClick={() => setIsLogin(false)} block>
          Hesabınız yok mu? Kayıt olun
        </Button>
      )}
    </Form>
  );

  const PersonnelLoginForm = () => (
    <Form
      name="personnel_login"
      className="auth-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      <Form.Item
        name="tcNumber"
        rules={[{ required: true, message: 'Lütfen TC kimlik numaranızı girin!' }]}
      >
        <Input 
          prefix={<IdcardOutlined />} 
          placeholder="TC Kimlik Numarası"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Şifre"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          size="large"
          block
        >
          Giriş Yap
        </Button>
      </Form.Item>
    </Form>
  );

  const RegisterForm = () => (
    <Form
      name="register"
      className="auth-form"
      onFinish={onFinish}
    >
      <Form.Item
        name="companyName"
        rules={[{ required: true, message: 'Lütfen firma adını girin!' }]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Firma Adı"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="taxNumber"
        rules={[{ required: true, message: 'Lütfen vergi numarasını girin!' }]}
      >
        <Input 
          prefix={<IdcardOutlined />} 
          placeholder="Vergi Numarası"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Lütfen email adresinizi girin!' },
          { type: 'email', message: 'Geçerli bir email adresi girin!' }
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Email"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Şifre"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          size="large"
          block
        >
          Kayıt Ol
        </Button>
      </Form.Item>
      <Button type="link" onClick={() => setIsLogin(true)} block>
        Zaten hesabınız var mı? Giriş yapın
      </Button>
    </Form>
  );

  return (
    <div className="auth-container" style={{ 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <ToastContainer />
      <Card className="auth-card" style={{
        width: '400px',
        borderRadius: '15px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }}>
        <div className="auth-logo" style={{ marginBottom: '24px'}}>
          <img src="logo.png" alt="Logo" style={{ width: '200px' }} />
        </div>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
          {!isLogin ? 'Firma Kaydı' : (isCompanyLogin ? 'Firma Girişi' : 'Personel Girişi')}
        </Title>
        
        {isLogin ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Button 
                type={isCompanyLogin ? "primary" : "default"}
                onClick={() => setIsCompanyLogin(true)}
                style={{ marginRight: '10px' }}
              >
                Firma Girişi
              </Button>
              <Button 
                type={!isCompanyLogin ? "primary" : "default"}
                onClick={() => setIsCompanyLogin(false)}
              >
                Personel Girişi
              </Button>
            </div>
            {isCompanyLogin ? <CompanyLoginForm /> : <PersonnelLoginForm />}
          </div>
        ) : (
          <RegisterForm />
        )}
      </Card>
    </div>
  );
};

export default AuthScreen;
