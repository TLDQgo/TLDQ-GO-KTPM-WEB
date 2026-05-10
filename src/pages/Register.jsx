import { useState } from "react";
import authApi from "../api/authApi";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/common/Input";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [role, setRole] = useState("customer");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password !== rePassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }
    try {
      const res = await authApi.register({
        email,
        password,
        full_name: fullName,
        role: role,
      });
      toast.success(res.message || "Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 text-white  justify-center pt-[200px]">
        <div className="px-10">
          <h1 className="text-4xl font-bold leading-tight">
            Hệ thống <br />
            Thương mại điện tử <span className="text-yellow-400">Bàn Ghế Công Thái Học</span>
          </h1>
          <p className="mt-4">Sức khoẻ của bạn là niềm vui của chúng tôi</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex pt-[100px]  justify-center">
        <div className="w-full max-w-md p-1">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Đăng ký tài khoản
          </h2>

          <div className="space-y-4">
            <Input
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex gap-3">
              <Input
                placeholder="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Nhập lại mật khẩu"
                type="password"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
            </div>


            <button
              onClick={handleRegister}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
            >
              Đăng ký
            </button>

            <p className="text-center text-sm">
              Đã có tài khoản?
              <Link to="/login">
                <span className="text-blue-600 ml-1 cursor-pointer">
                  Đăng nhập
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
