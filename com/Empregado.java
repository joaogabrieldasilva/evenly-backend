




class Paciente {

    private int id;
    private String name;

    public Paciente(int id, String name) {
        this.id = id;
        this.name = name;
    }
}

class Hospital {
    private Paciente pacienteSendoAtendido;

    
    public void atenderPaciente(Paciente paciente) {
        this.pacienteSendoAtendido = paciente;
    }

    public Paciente getPacienteSendoAtendido() {
        return this.pacienteSendoAtendido;
    }
}


class Main {

    public static void main(String args[]) {
        Hospital hospital = new Hospital();

        Paciente paciente = new Paciente(34, "João");

        hospital.atenderPaciente(paciente);
    }
}