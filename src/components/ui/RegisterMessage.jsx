import { message } from 'antd';

export const RegisterMessage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const mostrarMensaje = (tipo, texto, duracion = 2) => {
    const key = 'updatable';
    if (tipo === 'loading') {
      messageApi.open({
        key,
        type: 'loading',
        content: texto,
      });
    } else {
      messageApi.open({
        key,
        type: tipo,
        content: texto,
        duration: duracion,
      });
    }
  };

  return { mostrarMensaje, contextHolder };
};
