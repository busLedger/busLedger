import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { login, forgotPassword, checkActiveSession } from "../../api/auth.service";

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    if(form.email === "" || form.pass ==="" ){
       console.log("Los campos no deben de estar vacios")
    }else{
        setLoading(true);
        e.preventDefault();
        const auth = await login(form.email, form.password);
        setLoading(false);
        if(auth.authenticated==true) navigate('/home')
    }
  };
  const verifySession = async () =>{
   const session=  await checkActiveSession();
   if(session.uid!=null){
    navigate('/home')
   }
  }
  useEffect(()=>{
    verifySession();
  })
  const handleForgetPass = async () => {
    await forgotPassword(form.email);
  };
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600 w-full">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">Iniciar sesión</h2>
        <form className="mb-4" onSubmit={handleSubmit}>
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
          <Button loading={loading} text="Iniciar sesión" type="submit" className="w-full mt-4 btn-blue" />
        </form>
        <button
          onClick={handleForgetPass}
          className="w-full text-right cursor-pointer btn-forgot-password"
          
        >
          Olvide mi contraseña
        </button>
      </div>
    </div>
  );
};
export default Login;
