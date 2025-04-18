import TextField from "@components/TextField";

interface Props {
  name: string;
  handleChangeName: React.ChangeEventHandler<HTMLInputElement>;
}

const NameInput = ({ name, handleChangeName }: Props) => {
  return <TextField label="이름" value={name} onChange={handleChangeName} />;
};

export default NameInput;
