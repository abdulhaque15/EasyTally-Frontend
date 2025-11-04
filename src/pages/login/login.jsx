import { useNavigate } from 'react-router-dom';
import login from '../../assets/login.png';
import { useState } from 'react';
import { loginUser } from '../../api/authApi';
import ForgotPasswordDashboard from '../forgot-password/ForgotPasswordDashboard';
import "react-toastify/dist/ReactToastify.css";
import '../../App.css';
import { useAuthWrapper } from '../../helper/AuthWrapper';
import JWTService from '../../config/jwt.config';

const Login = () => {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchPermissions } = useAuthWrapper();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = await loginUser({ email, password });
            JWTService.saveTokenDetails(data?.data?.token);
            await fetchPermissions();
            navigate('/');
        } catch (error) {
            console.log('server error :', error);
            setError(error?.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="login-background">
                <div className="login-box d-flex justify-content-center">
                    <div className="row">
                        <div className="col-md-6 left-side">
                            <img src={login} alt="Visual" className="img-fluid left-image" />
                        </div>
                        <div className="col-md-6 right-panel bg-white">
                            <div className="text-center">
                                <h4 className="mb-2 logingheading">Welcome to UV Capital</h4>
                                <p className="login-title mb-4 fs-4">Login</p>

                                <form onSubmit={handleLogin}>
                                    <div className="mb-3 text-start">
                                        <input
                                            type="email"
                                            className="form-control rounded-border"
                                            placeholder="Enter email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 text-start">
                                        <input
                                            type="password"
                                            className="form-control rounded-border"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 d-flex justify-content-between align-items-center">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="remember" />
                                            <label className="form-check-label" htmlFor="remember">
                                                Remember me
                                            </label>
                                        </div>
                                        <button
                                            className="text-primary btn"
                                            type="button"
                                            onClick={() => setShow(true)}
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    {error && (
                                        <div className="text-danger mb-2">{error}</div>
                                    )}
                                    <button
                                        type="submit"
                                        className="btn custom-btn-secondary-login text-white w-50 rounded-border border-0"
                                        disabled={loading}
                                    >
                                        {loading ? 'Logging in...' : 'Login'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ForgotPasswordDashboard show={show} handleClose={() => setShow(false)} setShow={setShow} />
        </>
    );
};

export default Login;