import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';

import AuthLayout from '../../components/AuthLayout';
import CustomTextField from '../../components/CustomTextField';
import CustomButton from '../../components/CustomButton';
import { authApi } from '../../api/authApi';
import { loginStart, loginSuccess, loginFailure } from './authSlice';


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });


  //  for show password
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const response = await authApi.login(data);

      const authData = response.data;

      dispatch(loginSuccess({
        token: authData.token,
        user: authData.user || { email: data.email, name: 'Event Admin' }
      }));

      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(errorMsg));
      toast.error(errorMsg);
    }
  };

  return (
    <AuthLayout>
      <Card sx={{ border: 'none', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Form Header */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'primary.light',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
                color: 'primary.main',
              }}
            >
              <KeyIcon />
            </Box>
            <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Please sign in to manage your customer check-ins.
            </Typography>
          </Box>

          {/* Form Fields */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <CustomTextField
                label="Email Address"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                error={errors.email}
              />

              <CustomTextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 4,
                    message: 'Password must be at least 4 characters long',
                  },
                })}
                error={errors.password}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <CustomButton
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                loading={loading}
                sx={{ mt: 1, py: 1.25 }}
              >
                Sign In
              </CustomButton>
            </Box>
          </form>

          {/* Demo account tip */}
          <Box sx={{ mt: 3, p: 1.5, bgcolor: 'background.default', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" display="block" align="center">
              💡 Use any register email/password or <strong>admin@example.com / password</strong> to test connection.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default Login;
