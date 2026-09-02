export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          accao: string
          autor: string | null
          business_id: string | null
          created_at: string
          detalhe: string | null
          entidade: string
          entidade_id: string | null
          id: string
        }
        Insert: {
          accao: string
          autor?: string | null
          business_id?: string | null
          created_at?: string
          detalhe?: string | null
          entidade: string
          entidade_id?: string | null
          id?: string
        }
        Update: {
          accao?: string
          autor?: string | null
          business_id?: string | null
          created_at?: string
          detalhe?: string | null
          entidade?: string
          entidade_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          chave: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          categoria: string | null
          contactado_por: string | null
          created_at: string
          criado_por: string | null
          data_seguimento: string | null
          email: string | null
          encontrado_por: string | null
          estado: Database["public"]["Enums"]["business_status"]
          google_maps: string | null
          id: string
          is_demo: boolean
          localidade: string | null
          nome: string
          notas: string | null
          origem: string
          pessoa_contacto: string | null
          prioridade: Database["public"]["Enums"]["prioridade"]
          proxima_acao: string | null
          responsavel_nome: string | null
          telefone: string | null
          ultima_interacao: string | null
          updated_at: string
          valor_estimado: number | null
          website: string | null
          website_dominio: string | null
        }
        Insert: {
          categoria?: string | null
          contactado_por?: string | null
          created_at?: string
          criado_por?: string | null
          data_seguimento?: string | null
          email?: string | null
          encontrado_por?: string | null
          estado?: Database["public"]["Enums"]["business_status"]
          google_maps?: string | null
          id?: string
          is_demo?: boolean
          localidade?: string | null
          nome: string
          notas?: string | null
          origem?: string
          pessoa_contacto?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade"]
          proxima_acao?: string | null
          responsavel_nome?: string | null
          telefone?: string | null
          ultima_interacao?: string | null
          updated_at?: string
          valor_estimado?: number | null
          website?: string | null
          website_dominio?: string | null
        }
        Update: {
          categoria?: string | null
          contactado_por?: string | null
          created_at?: string
          criado_por?: string | null
          data_seguimento?: string | null
          email?: string | null
          encontrado_por?: string | null
          estado?: Database["public"]["Enums"]["business_status"]
          google_maps?: string | null
          id?: string
          is_demo?: boolean
          localidade?: string | null
          nome?: string
          notas?: string | null
          origem?: string
          pessoa_contacto?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade"]
          proxima_acao?: string | null
          responsavel_nome?: string | null
          telefone?: string | null
          ultima_interacao?: string | null
          updated_at?: string
          valor_estimado?: number | null
          website?: string | null
          website_dominio?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          assunto: string
          chave: string
          corpo: string
          created_at: string
          id: string
          is_demo: boolean
          nome: string
          updated_at: string
        }
        Insert: {
          assunto?: string
          chave: string
          corpo?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          nome: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          chave?: string
          corpo?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          business_id: string
          created_at: string
          data_proximo_contacto: string | null
          duracao_min: number | null
          funcao: string | null
          id: string
          is_demo: boolean
          notas: string | null
          ocorreu_em: string
          pessoa_contactada: string | null
          proximo_passo: string | null
          realizada_por: string | null
          resultado: Database["public"]["Enums"]["call_outcome"] | null
          tipo: string
        }
        Insert: {
          business_id: string
          created_at?: string
          data_proximo_contacto?: string | null
          duracao_min?: number | null
          funcao?: string | null
          id?: string
          is_demo?: boolean
          notas?: string | null
          ocorreu_em?: string
          pessoa_contactada?: string | null
          proximo_passo?: string | null
          realizada_por?: string | null
          resultado?: Database["public"]["Enums"]["call_outcome"] | null
          tipo?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          data_proximo_contacto?: string | null
          duracao_min?: number | null
          funcao?: string | null
          id?: string
          is_demo?: boolean
          notas?: string | null
          ocorreu_em?: string
          pessoa_contactada?: string | null
          proximo_passo?: string | null
          realizada_por?: string | null
          resultado?: Database["public"]["Enums"]["call_outcome"] | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          business_id: string
          created_at: string
          criado_por: string | null
          data_proxima_conversa: string | null
          email_decisor: string | null
          id: string
          interaction_id: string | null
          is_demo: boolean
          orcamento_previsto: number | null
          portefolio_solicitado: boolean
          preco_indicado: number | null
          pretende: string | null
          probabilidade: number
          proposta_solicitada: boolean
          reuniao_online: boolean
          tipo_projeto: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          criado_por?: string | null
          data_proxima_conversa?: string | null
          email_decisor?: string | null
          id?: string
          interaction_id?: string | null
          is_demo?: boolean
          orcamento_previsto?: number | null
          portefolio_solicitado?: boolean
          preco_indicado?: number | null
          pretende?: string | null
          probabilidade?: number
          proposta_solicitada?: boolean
          reuniao_online?: boolean
          tipo_projeto?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          criado_por?: string | null
          data_proxima_conversa?: string | null
          email_decisor?: string | null
          id?: string
          interaction_id?: string | null
          is_demo?: boolean
          orcamento_previsto?: number | null
          portefolio_solicitado?: boolean
          preco_indicado?: number | null
          pretende?: string | null
          probabilidade?: number
          proposta_solicitada?: boolean
          reuniao_online?: boolean
          tipo_projeto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          foto_url: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          foto_url?: string | null
          id: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          foto_url?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          created_at: string
          descricao: string | null
          destaque: boolean
          id: string
          imagem_url: string | null
          is_demo: boolean
          nome: string
          repo_id: number | null
          repo_url: string | null
          site_url: string | null
          tecnologias: string[]
          updated_at: string
          visivel: boolean
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          id?: string
          imagem_url?: string | null
          is_demo?: boolean
          nome: string
          repo_id?: number | null
          repo_url?: string | null
          site_url?: string | null
          tecnologias?: string[]
          updated_at?: string
          visivel?: boolean
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          id?: string
          imagem_url?: string | null
          is_demo?: boolean
          nome?: string
          repo_id?: number | null
          repo_url?: string | null
          site_url?: string | null
          tecnologias?: string[]
          updated_at?: string
          visivel?: boolean
        }
        Relationships: []
      }
      tasks: {
        Row: {
          business_id: string | null
          concluida_em: string | null
          created_at: string
          criado_por: string | null
          data_hora: string | null
          estado: Database["public"]["Enums"]["task_status"]
          id: string
          is_demo: boolean
          notas: string | null
          prioridade: Database["public"]["Enums"]["prioridade"]
          responsavel: string | null
          tipo: Database["public"]["Enums"]["task_type"]
          titulo: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          concluida_em?: string | null
          created_at?: string
          criado_por?: string | null
          data_hora?: string | null
          estado?: Database["public"]["Enums"]["task_status"]
          id?: string
          is_demo?: boolean
          notas?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade"]
          responsavel?: string | null
          tipo?: Database["public"]["Enums"]["task_type"]
          titulo: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          concluida_em?: string | null
          created_at?: string
          criado_por?: string | null
          data_hora?: string | null
          estado?: Database["public"]["Enums"]["task_status"]
          id?: string
          is_demo?: boolean
          notas?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade"]
          responsavel?: string | null
          tipo?: Database["public"]["Enums"]["task_type"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          aceite_em: string | null
          convidado_por: string | null
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          aceite_em?: string | null
          convidado_por?: string | null
          created_at?: string
          email: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          aceite_em?: string | null
          convidado_por?: string | null
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_requests: {
        Row: {
          business_id: string | null
          created_at: string
          email: string
          empresa: string | null
          id: string
          mensagem: string | null
          nome: string
          orcamento: string | null
          quer_reuniao: boolean
          telefone: string | null
          tipo_projeto: string | null
          tratado: boolean
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          email: string
          empresa?: string | null
          id?: string
          mensagem?: string | null
          nome: string
          orcamento?: string | null
          quer_reuniao?: boolean
          telefone?: string | null
          tipo_projeto?: string | null
          tratado?: boolean
        }
        Update: {
          business_id?: string | null
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          mensagem?: string | null
          nome?: string
          orcamento?: string | null
          quer_reuniao?: boolean
          telefone?: string | null
          tipo_projeto?: string | null
          tratado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "website_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "administrador" | "colaborador"
      business_status:
        | "por_contactar"
        | "tentativa_contacto"
        | "aguardar_resposta"
        | "email_por_enviar"
        | "email_enviado"
        | "seguimento"
        | "interessado"
        | "reuniao"
        | "proposta_enviada"
        | "em_negociacao"
        | "aceite"
        | "concluido"
        | "nao_interessado"
        | "arquivado"
      call_outcome:
        | "nao_atendeu"
        | "numero_nao_atribuido"
        | "numero_errado"
        | "nao_quis"
        | "interessado"
        | "pediu_email"
        | "pediu_portefolio"
        | "pediu_orcamento"
        | "pediu_reuniao"
        | "voltar_a_ligar"
        | "ferias"
        | "falar_superiores"
        | "ja_contactado"
        | "email_enviado"
        | "negocio_fechado"
        | "arquivado"
      prioridade: "alta" | "media" | "baixa"
      task_status: "pendente" | "concluida" | "cancelada"
      task_type:
        | "ligar"
        | "enviar_email"
        | "enviar_portefolio"
        | "preparar_orcamento"
        | "seguimento"
        | "marcar_reuniao"
        | "entregar_projeto"
        | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrador", "colaborador"],
      business_status: [
        "por_contactar",
        "tentativa_contacto",
        "aguardar_resposta",
        "email_por_enviar",
        "email_enviado",
        "seguimento",
        "interessado",
        "reuniao",
        "proposta_enviada",
        "em_negociacao",
        "aceite",
        "concluido",
        "nao_interessado",
        "arquivado",
      ],
      call_outcome: [
        "nao_atendeu",
        "numero_nao_atribuido",
        "numero_errado",
        "nao_quis",
        "interessado",
        "pediu_email",
        "pediu_portefolio",
        "pediu_orcamento",
        "pediu_reuniao",
        "voltar_a_ligar",
        "ferias",
        "falar_superiores",
        "ja_contactado",
        "email_enviado",
        "negocio_fechado",
        "arquivado",
      ],
      prioridade: ["alta", "media", "baixa"],
      task_status: ["pendente", "concluida", "cancelada"],
      task_type: [
        "ligar",
        "enviar_email",
        "enviar_portefolio",
        "preparar_orcamento",
        "seguimento",
        "marcar_reuniao",
        "entregar_projeto",
        "outro",
      ],
    },
  },
} as const
