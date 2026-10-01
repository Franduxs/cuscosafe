# DOCUMENTACIÓN TÉCNICA Y METODOLÓGICA DE INNOVACIÓN (SENATI)
## Proyecto: "CuscoSafe" para la Empresa EPG YUYARIY S.A.C.

- **Institución:** Servicio Nacional de Adiestramiento en Trabajo Industrial (SENATI)
- **Dirección Zonal:** Cusco - Apurímac - Madre de Dios
- **CFP / Escuela:** CFP Cusco / Escuela de Tecnologías de la Información
- **Carrera:** Ingeniería de Software con Inteligencia Artificial
- **Curso:** CNIU-126 Metodología y Formulación de Proyectos de Innovación y/o Mejora
- **Asesor Técnico:** Jimmy Arredondo Aquehua
- **Autor / Alumno:** Franduxs (Francito Soto Berrio)
- **Estándar:** Normas APA 7ma edición

---

## 1. Árbol de Problemas (Diagnóstico Operativo)

El problema principal identificado en **EPG YUYARIY S.A.C.** es la pérdida recurrente de tiempo operativo (15 a 30 minutos por incidente) debido a la desorientación y dispersión de turistas durante el servicio City Tour.

```mermaid
graph TD
    %% EFECTOS / CONSECUENCIAS (Nivel Superior)
    E1["Insatisfacción del turista e impacto negativo en reseñas (TripAdvisor / Google Maps)"]
    E2["Sobrecosto operativo por extensión no planificada de la jornada del guía turístico"]
    E3["Retraso en cadena de las reservas posteriores y tours de realidad virtual en sede Av. El Sol"]
    E4["Riesgo a la integridad física del turista en zonas periféricas del Centro Histórico"]

    E1 --- EFECTOS_LABEL["CONSECUENCIAS / EFECTOS"]
    E2 --- EFECTOS_LABEL
    E3 --- EFECTOS_LABEL
    E4 --- EFECTOS_LABEL

    EFECTOS_LABEL --> PROBLEMA_CENTRAL

    %% PROBLEMA CENTRAL
    PROBLEMA_CENTRAL["PROBLEMA CENTRAL:<br>Pérdida de 15 a 30 minutos por incidente debido a desorientación de turistas y falta de monitoreo continuo en el City Tour de EPG YUYARIY S.A.C."]

    %% CAUSAS RAÍZ (Nivel Inferior)
    PROBLEMA_CENTRAL --> CAUSAS_LABEL["CAUSAS DIRECTAS E INDIRECTAS"]

    CAUSAS_LABEL --> C1["Cañones urbanos y muros coloniales de piedra que bloquean la cobertura continua de datos 4G/5G"]
    CAUSAS_LABEL --> C2["Inexistencia de un canal unificado de pánico (dependencia de WhatsApp o llamadas dispersas)"]
    CAUSAS_LABEL --> C3["Topografía intrincada de callejones incaicos con señalética bilingüe deficiente"]
    CAUSAS_LABEL --> C4["Falta de un sistema automatizado de detección temprana de rezagos o desvíos del grupo"]
```

---

## 2. Diagrama de Causa-Efecto de Ishikawa (6M)

```mermaid
graph LR
    subgraph METODOS["Métodos"]
        M1["Búsqueda manual a pie en caso de extravío"]
        M2["Sin protocolo estandarizado de alerta inmediata"]
    end

    subgraph MAQUINARIA["Tecnología / Maquinaria"]
        T1["Pérdida de paquetes por apps dependientes de internet"]
        T2["APIs de mapas con costo por consumo (Google Maps inasequible)"]
    end

    subgraph MANO_OBRA["Mano de Obra / Personal"]
        H1["Guía turístico sobrecargado atendiendo a 15+ personas"]
        H2["Falta de visibilidad de la posición del grupo completo"]
    end

    subgraph MEDIO_AMBIENTE["Medio Ambiente"]
        A1["Calles coloniales estrechas (efecto jaula de Faraday en GPS/red)"]
        A2["Alta aglomeración en Plaza de Armas y San Pedro"]
    end

    subgraph MEDICION["Medición"]
        ME1["Sin registro de tiempos muertos por extravío"]
        ME2["Sin métricas de rezago de turistas"]
    end

    METODOS --> EFECTO
    MAQUINARIA --> EFECTO
    MANO_OBRA --> EFECTO
    MEDIO_AMBIENTE --> EFECTO
    MEDICION --> EFECTO

    EFECTO["DEMORAS DE 15 A 30 MIN<br>POR TURISTA DESORIENTADO"]
```

---

## 3. Diagrama de Flujo de Procesos: Situación Actual (As-Is) vs. Situación Propuesta con CuscoSafe (To-Be)

### Proceso Actual (As-Is):
```mermaid
sequenceDiagram
    autonumber
    actor T as Turista
    actor G as Guía / Personal YUYARIY
    actor A as Central Operativa

    T->>T: Se desorienta en Hatun Rumiyoc / Calle Triunfo
    Note over T: Intenta abrir WhatsApp o llamar (Falla por señal fluctuante)
    G->>G: Tras 15 minutos, nota la ausencia del turista en el punto de encuentro
    G->>A: Llama a la central para reportar turista extraviado
    G->>T: Guía detiene el tour e inicia recorrido a pie buscando en calles adyacentes
    Note over G,T: Retraso operativo acumulado: 25 a 35 minutos
    G->>T: Localización visual fortuita y reagrupación
```

### Proceso Propuesto con CuscoSafe (To-Be):
```mermaid
sequenceDiagram
    autonumber
    actor T as Turista (App CuscoSafe)
    participant DB as SQLite Local (Store & Forward)
    participant AI as Algoritmo Heurístico / Ray-Casting
    participant FS as Firebase Spark (Nube)
    actor O as Operador YUYARIY (Control Central)

    loop Cada 10 metros
        T->>DB: Guarda telemetría GPS local (is_synced = 0)
        T->>AI: Evalúa permanencia estática (>10 min) y polígono seguro
    end

    alt Turista presiona Botón SOS o AI detecta anomalía crítica
        T->>DB: Registra evento SOS de alta prioridad local
        T->>FS: Intenta transmisión inmediata
        opt En calle sin señal (Offline)
            Note over T,DB: Retiene evento en SQLite
            Note over T: Al detectar señal (Plaza o tienda), SyncDispatcher dispara paquete
        end
        FS->>O: Alerta sonora y marcador visual rojo en mapa interactivo
        O->>T: Operador envía asistencia precisa o comunica ruta de reincorporación
        Note over O,T: Tiempo promedio de resolución: < 3 minutos (90% de reducción)
    end
```

---

## 4. Protocolo de Pruebas de Campo en Cusco (Matriz de Validación)

- **Ruta de Prueba:** Sede YUYARIY (Av. El Sol) ➔ Qoricancha ➔ Calle San Agustín ➔ Calle Triunfo ➔ Plaza de Armas del Cusco.
- **Dispositivos de Prueba:** 2 Smartphones Android físicos (Xiaomi Redmi Note / Samsung Galaxy A).

| ID Caso | Escenario de Prueba | Comportamiento Esperado | Resultado Técnico |
| :--- | :--- | :--- | :---: |
| **CP-01** | Cruce por callejón de piedra sin señal 4G (Calle Zetas / Qoricancha). | Geolocator registra coordenadas; SQLite almacena con `is_synced = 0`. Cero caídas de la app. | **CONFORME** |
| **CP-02** | Salida a espacio abierto (Plaza de Armas) y reconexión a red móvil. | `SyncDispatcher` detecta conectividad, despacha lote a Firestore y marca `is_synced = 1`. | **CONFORME** |
| **CP-03** | Activación del Botón SOS en zona sin cobertura. | Almacenamiento local del evento de auxilio; subida prioritaria inmediata al reconectar. | **CONFORME** |
| **CP-04** | Simulación de inmovilidad >10 min en parada no programada. | `HeuristicAnomalyDetector` genera advertencia ámbar en pantalla del turista y del operador. | **CONFORME** |
| **CP-05** | Consumo energético durante 2 horas de City Tour continuo. | Filtro de distancia (`distanceFilter: 10m`) mantiene el drenaje de batería en menos del 7%. | **CONFORME** |
