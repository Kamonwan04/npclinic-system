--
-- PostgreSQL database dump
--

\restrict U5KufFzBWtjHpcWkB2GDdwkY7G2mfJSfjhSgiEB57SYjDHv82YqQuyKP0gnodIH

-- Dumped from database version 18.4 (Postgres.app)
-- Dumped by pg_dump version 18.4 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    patient_id integer,
    appointment_date timestamp without time zone NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_date timestamp without time zone,
    type text DEFAULT 'normal'::text,
    followup_status text,
    followup_note text,
    followup_round integer,
    followup_result text,
    deposit_amount numeric DEFAULT 0,
    total_amount numeric DEFAULT 0,
    paid_amount numeric DEFAULT 0,
    remaining_amount numeric DEFAULT 0,
    deposit_date timestamp without time zone,
    payment_status text DEFAULT 'pending'::text
);


ALTER TABLE public.appointments OWNER TO npstaff;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO npstaff;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: doctor_income; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.doctor_income (
    id integer NOT NULL,
    doctor_name text,
    date date,
    time_start text,
    time_end text,
    hour_rate numeric,
    hours numeric,
    total_hr numeric,
    total_df numeric,
    dfhr numeric,
    wht numeric,
    doctor_receive numeric,
    total_sales numeric,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.doctor_income OWNER TO npstaff;

--
-- Name: doctor_income_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.doctor_income_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_income_id_seq OWNER TO npstaff;

--
-- Name: doctor_income_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.doctor_income_id_seq OWNED BY public.doctor_income.id;


--
-- Name: doctor_income_items; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.doctor_income_items (
    id integer NOT NULL,
    income_id integer,
    procedure_name text,
    sales numeric,
    df_percent numeric,
    df_amount numeric
);


ALTER TABLE public.doctor_income_items OWNER TO npstaff;

--
-- Name: doctor_income_items_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.doctor_income_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_income_items_id_seq OWNER TO npstaff;

--
-- Name: doctor_income_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.doctor_income_items_id_seq OWNED BY public.doctor_income_items.id;


--
-- Name: follow_ups; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.follow_ups (
    id integer NOT NULL,
    patient_id integer,
    follow_date date,
    note text,
    status character varying DEFAULT 'pending'::character varying
);


ALTER TABLE public.follow_ups OWNER TO npstaff;

--
-- Name: follow_ups_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.follow_ups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.follow_ups_id_seq OWNER TO npstaff;

--
-- Name: follow_ups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.follow_ups_id_seq OWNED BY public.follow_ups.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    product_name character varying(255),
    category character varying(100),
    stock_qty numeric DEFAULT 0,
    min_qty numeric DEFAULT 0,
    unit character varying(50),
    cost_price numeric DEFAULT 0,
    sell_price numeric DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.inventory OWNER TO npstaff;

--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_id_seq OWNER TO npstaff;

--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: inventory_logs; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.inventory_logs (
    id integer NOT NULL,
    inventory_id integer,
    type character varying(50),
    qty numeric DEFAULT 0,
    note text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.inventory_logs OWNER TO npstaff;

--
-- Name: inventory_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.inventory_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_logs_id_seq OWNER TO npstaff;

--
-- Name: inventory_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.inventory_logs_id_seq OWNED BY public.inventory_logs.id;


--
-- Name: inventory_movement_items; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.inventory_movement_items (
    id integer NOT NULL,
    movement_id integer,
    inventory_id integer,
    qty integer NOT NULL
);


ALTER TABLE public.inventory_movement_items OWNER TO npstaff;

--
-- Name: inventory_movement_items_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.inventory_movement_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_movement_items_id_seq OWNER TO npstaff;

--
-- Name: inventory_movement_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.inventory_movement_items_id_seq OWNED BY public.inventory_movement_items.id;


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.inventory_movements (
    id integer NOT NULL,
    type character varying(20),
    note text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.inventory_movements OWNER TO npstaff;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.inventory_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_movements_id_seq OWNER TO npstaff;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.inventory_movements_id_seq OWNED BY public.inventory_movements.id;


--
-- Name: inventory_usage_items; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.inventory_usage_items (
    id integer NOT NULL,
    session_id integer,
    inventory_id integer,
    qty integer NOT NULL
);


ALTER TABLE public.inventory_usage_items OWNER TO npstaff;

--
-- Name: inventory_usage_items_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.inventory_usage_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_usage_items_id_seq OWNER TO npstaff;

--
-- Name: inventory_usage_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.inventory_usage_items_id_seq OWNED BY public.inventory_usage_items.id;


--
-- Name: inventory_usage_sessions; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.inventory_usage_sessions (
    id integer NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.inventory_usage_sessions OWNER TO npstaff;

--
-- Name: inventory_usage_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.inventory_usage_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_usage_sessions_id_seq OWNER TO npstaff;

--
-- Name: inventory_usage_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.inventory_usage_sessions_id_seq OWNED BY public.inventory_usage_sessions.id;


--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.medical_records (
    id integer NOT NULL,
    patient_id integer,
    description text,
    treatment text,
    photo_before text,
    photo_after text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    media jsonb
);


ALTER TABLE public.medical_records OWNER TO npstaff;

--
-- Name: medical_records_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.medical_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_records_id_seq OWNER TO npstaff;

--
-- Name: medical_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.medical_records_id_seq OWNED BY public.medical_records.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    profile_picture text,
    nickname character varying(255),
    allergies text,
    concerns text,
    lastname text,
    emergency_name text,
    emergency_phone text,
    source text,
    feeling text
);


ALTER TABLE public.patients OWNER TO npstaff;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO npstaff;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: npstaff
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    patient_id integer,
    amount numeric,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    appointment_id integer
);


ALTER TABLE public.payments OWNER TO npstaff;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: npstaff
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO npstaff;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: npstaff
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: doctor_income id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.doctor_income ALTER COLUMN id SET DEFAULT nextval('public.doctor_income_id_seq'::regclass);


--
-- Name: doctor_income_items id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.doctor_income_items ALTER COLUMN id SET DEFAULT nextval('public.doctor_income_items_id_seq'::regclass);


--
-- Name: follow_ups id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.follow_ups ALTER COLUMN id SET DEFAULT nextval('public.follow_ups_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: inventory_logs id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_logs ALTER COLUMN id SET DEFAULT nextval('public.inventory_logs_id_seq'::regclass);


--
-- Name: inventory_movement_items id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_movement_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_movement_items_id_seq'::regclass);


--
-- Name: inventory_movements id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_movements ALTER COLUMN id SET DEFAULT nextval('public.inventory_movements_id_seq'::regclass);


--
-- Name: inventory_usage_items id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_usage_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_usage_items_id_seq'::regclass);


--
-- Name: inventory_usage_sessions id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_usage_sessions ALTER COLUMN id SET DEFAULT nextval('public.inventory_usage_sessions_id_seq'::regclass);


--
-- Name: medical_records id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.medical_records ALTER COLUMN id SET DEFAULT nextval('public.medical_records_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.appointments (id, patient_id, appointment_date, note, created_at, end_date, type, followup_status, followup_note, followup_round, followup_result, deposit_amount, total_amount, paid_amount, remaining_amount, deposit_date, payment_status) FROM stdin;
\.


--
-- Data for Name: doctor_income; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.doctor_income (id, doctor_name, date, time_start, time_end, hour_rate, hours, total_hr, total_df, dfhr, wht, doctor_receive, total_sales, created_at) FROM stdin;
\.


--
-- Data for Name: doctor_income_items; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.doctor_income_items (id, income_id, procedure_name, sales, df_percent, df_amount) FROM stdin;
\.


--
-- Data for Name: follow_ups; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.follow_ups (id, patient_id, follow_date, note, status) FROM stdin;
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.inventory (id, product_name, category, stock_qty, min_qty, unit, cost_price, sell_price, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_logs; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.inventory_logs (id, inventory_id, type, qty, note, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_movement_items; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.inventory_movement_items (id, movement_id, inventory_id, qty) FROM stdin;
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.inventory_movements (id, type, note, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_usage_items; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.inventory_usage_items (id, session_id, inventory_id, qty) FROM stdin;
\.


--
-- Data for Name: inventory_usage_sessions; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.inventory_usage_sessions (id, note, created_at) FROM stdin;
\.


--
-- Data for Name: medical_records; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.medical_records (id, patient_id, description, treatment, photo_before, photo_after, created_at, media) FROM stdin;
13	19		sf	\N	\N	2026-05-21 13:26:47.783905	{"after": [], "before": [{"url": "data:image/png;base64,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abmHS/fu3e2OO+5wwTkFdH/77Tc3WstWGTZsmAtSKlCmYeGsPgXhHnjggaS1LaiA3JtvvmmPPvpovqrHCkQri1OBTBUdwzvvvNP69u3rPvtf++23n910000F7tsjjzziAs3PPfecdevWzb777ju74oor7Jqrr7GPP/nYBXnDy9N6wwFKHR8FwX3VaGWcHnzwwfbCCy+48++www7zs2/0qoxDtXWo4gODeh/OUvTtJfrsw/B0eu+XoVd6c5YeBQEEEEAAAQQQQAABBBBAoDQIVG3d1gURV0yZZBN797Slo0davX0Psi3PucS2feIVG7DHdqWBIWX7mLJAogI0Cq4oE1AZXbvttptdddVVtjKIECvDToE9BRHfeOMN69ChQx6AAmMnnHCCvf/++3bOOee44d9++60deuihblkK+Ci4Fquab69evdy8elWwUtOqKHC2aNEi69Gjh5188skucBTP+gvbj3DWn1tRnL8UBPMBMBmFi4JU2u527dqZ2keMzMRTu4oKJKqNxXAgUe3+KYioQJ9MlVXnDf/3v/9Z+/btbdy4cW4+za+grYJnCqwqg07zKlNS61Wmo7IB9VlFwTYFypT5JxMtT37KACysqB3EESNGRJ1sxowZGw1X4FSdtMhA26eA65dffun2WefGZ5995sYp21WG6ixF54f2QVXFFZBV0E/Bv1j7ttFK/x3Q44Eebtnavzp16jgjLa9169Z23nnnuaneffdde/zxx935re1TeeaZZ1wQ0X0o5JeqLKso0zBcwsN94DBWwFDBQwUjNQ+BxLAi7xFAAAEEEEAAAQQQQAABBLJZoGrLVm73Fvz8o83r/417P+31F2zF1Mm2+QGHmqo8r1m00Ko038raP/iUVWrQKKjyvN6W/DnCRl52jq1bttRqdNjOOjzxsi36fZCrHr1m4QIrG8QRRl15gS38daBbZrW221jHZ163CQ/fZzPffdNaXnmTNTjsGCsT1Epcu3SJje91l/3z+Udu2p2++dUtv1aXHW39qpU25OQjbOX0qW5cpv9KWSBRgRxVT1awaezYsS5zS8EYVQNW8GufffZxveaqynO4KNilQNjff/+dN1hBtyVLlrgAoIKQqqZ733335Y0Pv1HwR70bK4NRRQEfZTGq6FVByVmzZsW9/sL2wy24kF/9+/fPqx6rwKAyEFX12vforCBYuCiA9tFHH7mq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QAABBBImMGbshIQtiwUlTqBN6xZ5C5s7d27e+1S9qVu3br5VpcM25NugLPpQ0rYlvf50OZQEEtPlSLAdCCCAAAIIIIAAAggggAACaS0QDlql9YaWko2LFtyNDOwlkyJWYCkdtiGZ+12Syy5p25Jef0na+3VTtdlL8IoAAggggAACCCCAAAIIIIAAAggggAACMQUIJMakYQQCCCCAAAIIIIAAAggggAACCCCAAAIIeAECiV6CVwQQQAABBBBAAAEEEEAAAQQQQAABBBCIKUAgMSYNIxBAAAEEEEAAAQQQQAABBBBAAAEEEEDACxBI9BK8IoAAAggggAACCCCAAAIIIIAAAggggEBMAQKJMWkYgQACCCCAAAIIIIAAAggggAACCCCAAAJegECil+AVAQQQQAABBBBAAAEEEEAAAQQQQAABBGIKEEiMScMIBBBAAAEEEEAAAQQQQAABBJIjMHr0aPv+++83WvjEiRPtrbfesgEDBtj69es3Gs8ABIorMHPmTPvtt98sNzd3kxa1dOlSN//ixYtjzt+/f3+bPHly1PHxzB91RgamhQCBxLQ4DGwEAggggAACCCCAAAIIIIBAaRGYMWOGXXXVVfbll1/m2+WXX37Zzj33XFMQ5s4777Qbbrgh3/h4P6xduzZmEFLBo4ICSBq3YsWKmKtavXp1zHGZOEIB3Tlz5uRt+g8//JDvc96IFLzRdoS3JRmrXLJkid1444320EMP2aYcS50fDzzwgJt/3LhxUTdx5cqV9vTTT0fdl3jmj7rQTRioY6ufkijh9eqYhj+XxPYkcp3lErkwloUAAggggAACCCCAAAIIIIAAArEFPvroI3viiSds3bp1+SZSsOG1116zK6+80g444AD7+++/7YILLrARI0ZYhw4d8k2rbLL77rvPlBG2+eabu6BhnTp17Nprr7XrrrvO/vnnHzd9u3btrEePHlaxYkX3uXfv3vb555+797169TJty6RJk9z2KHioZf7+++8uwFShQgU777zz7LDDDnPTP/vss9anTx/3XuMUCN1zzz1t9uzZbp3Tpk2zGjVqmLZD6//ggw/ctOn8S8Edubdt29ZtpoKI9erVcz+p3m5ty59//mm777570lY9ePBge/LJJ02Bvk0pCoA//PDDpmNdUBkzZowb7V39tPHO76cv7mvdunVNx1QlcluKu+x45te6dTx1TvlAYklsRzzbWpRpCCQWRYtpEUAAAQQQQAABBBBAAAEEECiGgLIOjz/+eFMV5nBG2F9//eWWus8++7jXrbbayhQIGThw4EaBxJ49e1qjRo3s3nvvtVWrVtnYsWOtY8eOLotxhx12sFNOOcWmTJniMs9UfVqBSQUMP/nkE7fsfffd11VNXbNmjdsGZTCeeeaZ1qRJE3vnnXfcsOeff94ee+wx69Kli6kq7KeffuoCja1atXKBRwUlFUh86aWXbMGCBW5c9erV3bbUrl27QKFXX33Vjdd2RisKUmp/Yo2PNk9Rh/kgog/c+SBiSQR6wkFEBZ2SVb7++mvbcsstXQBaQb2ilmHDhtny5cutc+fOpqBkrDJy5Eh37latWjXfJPHOn2+mYnyQpY5vSQQT/Xnkg4kltR3F4Is5K1WbY9IwAgEEEEAAAQQQQAABBBBAAIHECrz55pt2xhlnWLly+fN6pk+f7jL6wsOVbTh37tx8G6DAYdOmTV1G4+WXX24333yzKYCnwONll11ml156qSmQt91221mbNm1MwSMVn6V42mmnuaCigou+KKCpIOLQoUPtrLPOslq1auUF8ZQZqcxGZTAqgKSsw6OOOsoFoxTA1PZqe+655x63brWLt9NOO/lFR31VQOmVV15xWY2REyiIqPHJLKUxiCjPs88+22655RarX7/+JvF269bNHn30Udtmm20KnH/UqFFRp4l3/gIXXsSRPpiobE+fFVjERWzy5Aomav0+kKlgYjZUcyaQuMmnBDMigAACCCCAAAIIIIAAAgggUDQBVQuOVhYuXGiR4ypXrmzLli3LN7mqKau6sqpHf/jhh6bsQrVZp6rJCvjl5OTkTa8Ao2/vUJmFCuQoI1LVqpWx6EuVKlXccvRZAUOVmjVrule1aaftaNmypfusXwomqqiKrKpiP/LII/buu+/aTTfd5Ko0//LLL258rF/KqFTGoQKGChz64oOIycxGVCAnXIXYB5d8BpnfllS9alt03JKZiej3RRmuhRVlsKpKu37uv//+fJMrQF2mTMFhJGW3KpgcLdgYz/z5VpigD7KVsaxTXfx55c8zBRO1HToPM7UUfAZk6l6x3QgggAACCCCAAAIIIIAAAghkkICCLD7o5zdbvdsWlD2mbEBVZVaJDDj6ZfhXBYAaN27sPipjsGHDhn6Ue50/f74LZKrK9KYWn4moDj0KK5HBxHAQUeOSVXxQyWeJRQZ6krXeWMv1Aa50CSyVLVvW/E/58uVjbXbM4cpgVWnfvn3MaVI9wgePZZ3q4gOI/jzTeZeqwHGy9jV/LnWy1sJyEUAAAQQQQAABBBBAAAEEEEAgpoACewoGKnhYrVo117PylMlTrHv37jHnUTt1aqsw3tKvXz+XlZiMtgfV5l5RtkXbrIChDyDqszIRkxlE1DpUwkEdZYiVZPt1kduSiszEDQrRf3uP6GMLH6r2EZWx6jNaC58juVMoiOiDd946uWv8b+kKImr9MlXRduj4pno7/tuixLwjIzExjiwFAQQQQACpv9daAABAAElEQVQBBBBAAAEEEEAAgU0WULVjVW1WddJZs2a5qsur16zOC0JEW7Daq1PVZhXfM3O06TRMbSuqKrKyzNReonpbVu+7kdWpY81f2HBVbVZHHspmq1SpUmGT541X4PDUU09NWRDRr1jBHAV1fGaigj0K+vgMMj9dKl61LcpS07ZoG5JdwtXfN2Vdfn7/Gl6GehkvLBvRz+dfw/Mn8j1BxERq/rcsMhL/s+AdAggggAACCCCAAAIIIIAAAiUioACfOsK49dZbXUcn6vFW7Q+qw5VYZeeddzZ13tK1a1fX4UrkdOH27NT78+LFi61///7uR9MqiHjxxRdHzuY++yCPf406UWhgp06d7P777jdtt7anKEUZksnIkixsG3xmmAJOCioqmFgSgURtp98Wda6T7KzEcLuUhRlFG7/ffvuZfqIVdfZTWCC5oPmjLbM4w3RMk+0ZuX06n/TjMxH9+eWPceT0mfY5J2g4NTfTNprtRQABBBBAAAEEEEAAAQQQQCCVAmPGTrA2rVskfZW6RS9KMEmZhoVlIyZ9o/9dgXp/VkA03uBjcbcr8pjILZ4ORYq7Xj9/tPVFG+anT8ZrqteXjH2Id5mp3tfI9UV+jne7N3W6VK8v3u0kIzFeKaZDAAEEEEAAAQQQQAABBBBAIMkCCsIVJYMqXYKIYklUNekkE7N4BBAohgBtJBYDj1kRQAABBBBAAAEEEEAAAQQQQAABBBAoLQIEEkvLkWY/EUAAAQQQQAABBBBAAAEEEEAAAQQQKIYAgcRi4DErAggggAACCCCAAAIIIIAAAggggAACpUWAQGJpOdLsJwIIIIAAAggggAACCCCAAAIIIIAAAsUQIJBYDDxmRQABBBBAAAEEEEAAAQQQQAABBBBAoLQIEEgsLUea/UQAAQQQQAABBBBAAAEEEEAAAQQQQKAYAgQSi4HHrAgggAACCCCAAAIIIIAAAggggAACCJQWgXKlZUfZTwQQQAABBBBAAAEEEEAAAQQQyG6BuXPnlvgOpsM2lDhCkjagpG1Lev1JYi3SYnNyg1KkOZgYAQQQQAABBBBAAAEEEEAAgVImMGbshFK2x5mxu21at8iMDWUrEcgSAQKJWXIg2Q0EEEAAAQQQQAABBBBAAAEEEEAAAQSSKUAbicnUZdkIIIAAAggggAACCCCAAAIIIIAAAghkiQCBxCw5kOwGAggggAACCCCAAAIIIIAAAggggAACyRQgkJhMXZaNAAIIIIAAAggggAACCCCAAAIIIIBAlggQSMySA8luIIAAAggggAACCCCAAAIIIIAAAgggkEwBAonJ1GXZCCCAAAIIIIAAAggggAACCCCAAAIIZIkAgcQsOZDsBgIIIIAAAggggAACCCCAAAIIIIAAAskUIJCYTF2WjQACCCCAAAIIIIAAAggggAACCCCAQJYIEEjMkgPJbiCAAAIIIIAAAggggAACCCCAAAIIIJBMAQKJydRl2QgggAACCCCAAAIIIIAAAggggAACCGSJAIHELDmQ7AYCCCCAAAIIIIAAAggggAACCCCAAALJFCCQmExdlo0AAggggAACCCCAAAIIIIAAAggggECWCBBIzJIDyW4ggAACCCCAAAIIIIAAAggggAACCCCQTAECicnUZdkIIIAAAggggAACCCCAAAIIIIAAAghkiQCBxCw5kOwGAggggAACCCCAAAIIIIAAAggggAACyRQgkJhMXZaNAAIIIIAAAggggAACCCCAAAIIIIBAlggQSMySA8luIIAAAggggAACCCCAAAIIIIAAAgggkEwBAonJ1GXZCCCAAAIIIIAAAggggAACCCCAAAIIZIkAgcQsOZDsBgIIIIAAAggggAACCCCAAAIIIIAAAskUIJCYTF2WjQACCCCAAAIIIIAAAggggAACCCCAQJYIEEjMkgPJbiCAAAIIIIAAAggggAACCCCAAAIIIJBMAQKJydRl2QgggAACCCCAAAIIIIAAAggggAACCGSJAIHELDmQ7AYCCCCAAAIIIIAAAggggAACCCCAAALJFCCQmExdlo0AAggggAACCCCAAAIIIIAAAggggECWCBBIzJIDyW4ggAACCCCAAAIIIIAAAggggAACCCCQTAECicnUZdkIIIAAAggggAACCCCAAAIIIIAAAghkiQCBxCw5kOwGAggggAACCCCAAAIIIIAAAggggAACyRQgkJhMXZaNAAIIIIAAAggggAACCCCAAAIIIIBAlgiUaCDx1ltvtV9++SVLKNkNBBBAAAEEEEAAAQQQQAABBBBAAAEEslegRAOJd9xxh40cOTJ7ddkzBBBAAAEEEEAAAQQQQAABBBBAAAEEskSgRAOJu+22m9WpUydLKNkNBBBAAAEEEECgdAusXLnSzjrrLPvoo49KNwR7jwACCCCAQJYKzJo1y0aNGmVr1661adOmWW5ubpbuKbsVSyDlgUSdaC+88IJ17tzZ9txzT1uyZEmsbWM4AggggAACCCCAQJoLjBgxwlq2bGk1atSwpk2b2vLly23nnXdO861m8xBAAAEEEChZgd69e9sNN9xQohvx/fff2/HHH299+/a1BQsW2CGHHGJPPfVUzG265557rGHDhrbNNttY7dq1rUmTJnb77bfHnD7aiLvuusvOOOMMmzBhgr3//vtunX/++acNGzbMPYicMWNGtNkYlkYCKQ0kPvfcc7b33nu76PXSpUtNVZvnzp2bRhxsCgIIIIAAAggggEBRBJ588knbYost7JlnnrFBgwbZp59+an/99VdRFsG0CCCAAAIIlDoBZfX9/vvvJbrfV111lXv4d+aZZ9p9993n/ofHehi4bNkyu/HGG9327rvvvnbbbbfZq6++aldffXXc+zBmzBh78cUX3cNH9Zlx00032T///GPXX3+9PfTQQ64PjW7dutmbb74Z9zKZMPUCKQskKvPwnHPOsZkzZ9oHH3zgnlZrd1esWJH6vWaNCCCAAAIIZKiAOinLycmxiy66yO2BssD02f/os77krVq1Kuoerlu3zj091vRPP/101Gn8wNdee80tN9qXuYkTJ7pxF1xwgZ+c11IqsN9++9kff/xhX375pW277bZWuXJlq1KlSinVYLcRQAABBBCIT2CXXXaxAw44IL6JkzTVhRdeaJdddpmrKaqg5rvvvuv+l0dbnf63q4bphx9+6AJ+v/32m5188slWtWrVaJNHHda8eXPr0KGDPfroo6bvmbvvvruddNJJLhPx888/d4FJrePEE0+0OXPmRF0GA0teoFyqNqFatWqmLMTwSfbjjz9uFEhUPfty5VK2WanafdaDAAKlREDXsDJlyrgndAcddJDtuOOOeXse6/q2fv16N0/ehLxBIA6ByPZoVK1ED+fee+89U7UTZYjpy2Fk6devn/sSqOFPPPGEnXfeeZGTbPRZ52isosAkpXQLHHHEES6boFKlSvb444+773EVKlTIhxLr+pdvon8/xJpW57zOxbJly0abjWFZKrAp/yP9NUv/jyOLziP9RBsXa12aXg9fKAgggEBxBfz1RK8KwkUWfa/S9SnaNaegcX65kcuLNVzTaZyqGJ9++unuAXT4IaCfz79qem2Tvl/qR1WaN+U7YMWKFV1imR54a3n6vqBMRz2YDn93mD9/Pg8lhZ6mZeP/rknaUFV1OfLII10Kq25sdCOj6LOqO6stnbPPPtvq169v5cuXt5122slFuJO0KSwWAQQQSKiAgjdXXHGFu77pGlarVi27884783ql/+abb2zrrbd21zdli918881u/dOnT3fXPk2v8ffff78bPnXqVPe5Y8eOedUDr7vuOjdME+i6ee2117p2TPRA5uOPP3bz8av0ClSvXt1uueUWu/fee+355593EF988UVUkJdfftkN32uvvWz48OE2dOjQvOn0hVDL0f/j9u3b21dffZU3Tm/eeecd1xaexqv6iS8K/OgcVicbmk/v9fBQT6z1Wee92t/xT5bVSPfll1/uvoRq2ksuucRWr17tFvfWW2+5p/P6cql5Y+2HXzevyRX46aef3PkwePBgd63RsR83bpxbqc4VHVu9aryOlzIZdHOhY6ybj0ceeSTv2qh2FDVeZeHChW65ajdbpaBp1WbTcccd526s9LBZbWz7bXAz8ytrBHr27OluLPU/T0VthylwrOG6zuywww7u/NL/VRWdPzondY6o6Dzcdddd3Tz636p7Dn/d+fvvv107XDVr1nTjFQD341566SV3/6F16VxTdUMV3aOceuqppnnUPJOys7W+SZMmufH8QgABBIoi8PDDD7vriYJ3DRo0cNckdVKmomZBdP3S/zldc3Rv4QN1scatWbPG3Vfo/6uWp2ve4sWL3fJGjx5tqjGgZammipanewuVyOvh0Ucf7YJ5Gqdl+uueYjQKahbWBqK+q+n7gNpX9N/nFNPxtVZUfVrjdS1XUXuIW265pYsJ6fOvv/7qru2aX31paH90XdcD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", "type": "image/png"}]}
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.patients (id, name, phone, created_at, profile_picture, nickname, allergies, concerns, lastname, emergency_name, emergency_phone, source, feeling) FROM stdin;
19	ดูดี	0810247536	2026-05-15 15:35:46.713735	\N	เพลง		ปรับรูปหน้า / โบท็อกซ์ / ฟิลเลอร์	พล	นุ	0802453100	instagram	
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: npstaff
--

COPY public.payments (id, patient_id, amount, created_at, appointment_id) FROM stdin;
\.


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.appointments_id_seq', 90, true);


--
-- Name: doctor_income_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.doctor_income_id_seq', 4, true);


--
-- Name: doctor_income_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.doctor_income_items_id_seq', 10, true);


--
-- Name: follow_ups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.follow_ups_id_seq', 24, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.inventory_id_seq', 6, true);


--
-- Name: inventory_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.inventory_logs_id_seq', 1, true);


--
-- Name: inventory_movement_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.inventory_movement_items_id_seq', 1, false);


--
-- Name: inventory_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.inventory_movements_id_seq', 1, false);


--
-- Name: inventory_usage_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.inventory_usage_items_id_seq', 1, false);


--
-- Name: inventory_usage_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.inventory_usage_sessions_id_seq', 1, false);


--
-- Name: medical_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.medical_records_id_seq', 13, true);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.patients_id_seq', 20, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: npstaff
--

SELECT pg_catalog.setval('public.payments_id_seq', 10, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: doctor_income_items doctor_income_items_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.doctor_income_items
    ADD CONSTRAINT doctor_income_items_pkey PRIMARY KEY (id);


--
-- Name: doctor_income doctor_income_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.doctor_income
    ADD CONSTRAINT doctor_income_pkey PRIMARY KEY (id);


--
-- Name: follow_ups follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT follow_ups_pkey PRIMARY KEY (id);


--
-- Name: inventory_logs inventory_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_pkey PRIMARY KEY (id);


--
-- Name: inventory_movement_items inventory_movement_items_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_movement_items
    ADD CONSTRAINT inventory_movement_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: inventory_usage_items inventory_usage_items_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_usage_items
    ADD CONSTRAINT inventory_usage_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_usage_sessions inventory_usage_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_usage_sessions
    ADD CONSTRAINT inventory_usage_sessions_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: doctor_income_items doctor_income_items_income_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.doctor_income_items
    ADD CONSTRAINT doctor_income_items_income_id_fkey FOREIGN KEY (income_id) REFERENCES public.doctor_income(id) ON DELETE CASCADE;


--
-- Name: follow_ups follow_ups_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT follow_ups_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: inventory_logs inventory_logs_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);


--
-- Name: inventory_movement_items inventory_movement_items_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_movement_items
    ADD CONSTRAINT inventory_movement_items_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);


--
-- Name: inventory_movement_items inventory_movement_items_movement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_movement_items
    ADD CONSTRAINT inventory_movement_items_movement_id_fkey FOREIGN KEY (movement_id) REFERENCES public.inventory_movements(id);


--
-- Name: inventory_usage_items inventory_usage_items_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_usage_items
    ADD CONSTRAINT inventory_usage_items_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);


--
-- Name: inventory_usage_items inventory_usage_items_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.inventory_usage_items
    ADD CONSTRAINT inventory_usage_items_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.inventory_usage_sessions(id);


--
-- Name: medical_records medical_records_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: payments payments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: npstaff
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- PostgreSQL database dump complete
--

\unrestrict U5KufFzBWtjHpcWkB2GDdwkY7G2mfJSfjhSgiEB57SYjDHv82YqQuyKP0gnodIH

