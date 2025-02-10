import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", form);
    navigate("/home");
    };
    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600 w-full">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Correo electrónico"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Ingrese su correo"
                    />
                    <Input
                        label="Contraseña"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Ingrese su contraseña"
                    />
                    <Button text="Iniciar sesión" type="submit" className="w-full mt-4" />
                </form>
            </div>
        </div>
    );
};
export default Login;
