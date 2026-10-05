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
      business_files: {
        Row: {
          business_id: string
          caminho: string
          carregado_por: string | null
          created_at: string
          id: string
          nome: string
          notas: string | null
          tamanho: number
          updated_at: string
          versao: string | null
        }
        Insert: {
          business_id: string
          caminho: string
          carregado_por?: string | null
          created_at?: string
          id?: string
          nome: string
          notas?: string | null
          tamanho?: number
          updated_at?: string
          versao?: string | null
        }
        Update: {
          business_id?: string
          caminho?: string
          carregado_por?: string | null
          created_at?: string
          id?: string
          nome?: string
          notas?: string | null
          tamanho?: number
          updated_at?: string
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_files_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      contact_form_config: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value_hash: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value_hash: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value_hash?: string
        }
        Relationships: []
      }
      contact_submission_guards: {
        Row: {
          confirmation_allowed: boolean
          created_at: string
          dedupe_key: string
          email_hash: string
          id: string
          ip_hash: string
        }
        Insert: {
          confirmation_allowed?: boolean
          created_at?: string
          dedupe_key: string
          email_hash: string
          id?: string
          ip_hash: string
        }
        Update: {
          confirmation_allowed?: boolean
          created_at?: string
          dedupe_key?: string
          email_hash?: string
          id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      crm_restaurants: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          id: string
          nome: string
          slug: string
          subdominio: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id: string
          nome: string
          slug: string
          subdominio?: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome?: string
          slug?: string
          subdominio?: string
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
      menu_categories: {
        Row: {
          id: string
          name: string
          restaurant_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          restaurant_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          restaurant_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean
          category_id: string | null
          created_at: string
          description: string
          featured: boolean
          id: string
          image: string
          name: string
          price: number
          restaurant_id: string
          sort_order: number
        }
        Insert: {
          available?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image?: string
          name: string
          price?: number
          restaurant_id: string
          sort_order?: number
        }
        Update: {
          available?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image?: string
          name?: string
          price?: number
          restaurant_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          price: number
          product_id: string | null
          qty: number
          restaurant_id: string
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          price: number
          product_id?: string | null
          qty: number
          restaurant_id: string
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          qty?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_token: string
          closed: boolean
          created_at: string
          id: string
          note: string
          order_number: number
          restaurant_id: string
          status: string
          table_id: string | null
          table_number: number
          total: number
        }
        Insert: {
          client_token?: string
          closed?: boolean
          created_at?: string
          id?: string
          note?: string
          order_number: number
          restaurant_id: string
          status?: string
          table_id?: string | null
          table_number: number
          total?: number
        }
        Update: {
          client_token?: string
          closed?: boolean
          created_at?: string
          id?: string
          note?: string
          order_number?: number
          restaurant_id?: string
          status?: string
          table_id?: string | null
          table_number?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
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
      reservations: {
        Row: {
          created_at: string
          date: string
          email: string
          guests: number
          id: string
          name: string
          notes: string
          origin: string
          phone: string
          restaurant_id: string
          status: string
          table_number: number | null
          time: string
        }
        Insert: {
          created_at?: string
          date: string
          email?: string
          guests: number
          id?: string
          name: string
          notes?: string
          origin?: string
          phone?: string
          restaurant_id: string
          status?: string
          table_number?: number | null
          time: string
        }
        Update: {
          created_at?: string
          date?: string
          email?: string
          guests?: number
          id?: string
          name?: string
          notes?: string
          origin?: string
          phone?: string
          restaurant_id?: string
          status?: string
          table_number?: number | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_invites: {
        Row: {
          aceite: boolean
          criado_em: string
          criado_por: string | null
          email: string
          expira_em: string
          id: string
          restaurant_id: string
          role: string
          token: string
        }
        Insert: {
          aceite?: boolean
          criado_em?: string
          criado_por?: string | null
          email: string
          expira_em?: string
          id?: string
          restaurant_id: string
          role: string
          token?: string
        }
        Update: {
          aceite?: boolean
          criado_em?: string
          criado_por?: string | null
          email?: string
          expira_em?: string
          id?: string
          restaurant_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_invites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "crm_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_memberships: {
        Row: {
          ativo: boolean
          criado_em: string
          criado_por: string | null
          id: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          criado_por?: string | null
          id?: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          criado_por?: string | null
          id?: string
          restaurant_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_memberships_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "crm_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          address: string
          email: string
          features: Json
          hours: string[]
          introduction: string
          logo: string
          next_order: number
          phone: string
          primary_color: string
          restaurant_id: string
          tagline: string
          updated_at: string
        }
        Insert: {
          address?: string
          email?: string
          features?: Json
          hours?: string[]
          introduction?: string
          logo?: string
          next_order?: number
          phone?: string
          primary_color?: string
          restaurant_id: string
          tagline?: string
          updated_at?: string
        }
        Update: {
          address?: string
          email?: string
          features?: Json
          hours?: string[]
          introduction?: string
          logo?: string
          next_order?: number
          phone?: string
          primary_color?: string
          restaurant_id?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "crm_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      security_ip_blocks: {
        Row: {
          blocked: boolean
          blocked_at: string | null
          failed_count: number
          ip: string
          last_attempt_at: string
          last_email: string | null
          unblocked_at: string | null
          unblocked_by: string | null
        }
        Insert: {
          blocked?: boolean
          blocked_at?: string | null
          failed_count?: number
          ip: string
          last_attempt_at?: string
          last_email?: string | null
          unblocked_at?: string | null
          unblocked_by?: string | null
        }
        Update: {
          blocked?: boolean
          blocked_at?: string | null
          failed_count?: number
          ip?: string
          last_attempt_at?: string
          last_email?: string | null
          unblocked_at?: string | null
          unblocked_by?: string | null
        }
        Relationships: []
      }
      security_login_attempts: {
        Row: {
          cidade: string | null
          created_at: string
          email: string
          id: string
          ip: string | null
          motivo: string | null
          pais: string | null
          user_agent: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          email: string
          id?: string
          ip?: string | null
          motivo?: string | null
          pais?: string | null
          user_agent?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string
          email?: string
          id?: string
          ip?: string | null
          motivo?: string | null
          pais?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          created_at: string
          id: string
          resolved: boolean
          restaurant_id: string
          table_id: string | null
          table_number: number
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          resolved?: boolean
          restaurant_id: string
          table_id?: string | null
          table_number: number
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          resolved?: boolean
          restaurant_id?: string
          table_id?: string | null
          table_number?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          active: boolean
          id: string
          number: number
          restaurant_id: string
          seats: number
        }
        Insert: {
          active?: boolean
          id?: string
          number: number
          restaurant_id: string
          seats?: number
        }
        Update: {
          active?: boolean
          id?: string
          number?: number
          restaurant_id?: string
          seats?: number
        }
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
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
      can_access_restaurant: {
        Args: { _restaurant_id: string }
        Returns: boolean
      }
      can_manage_restaurant: {
        Args: { _restaurant_id: string; _roles: string[] }
        Returns: boolean
      }
      free_table: {
        Args: { _number: number; _restaurant_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: { Args: { _user_id: string }; Returns: boolean }
      login_ip_blocked: { Args: never; Returns: boolean }
      place_order: {
        Args: { _items: Json; _note: string; _table_id: string }
        Returns: {
          client_token: string
          id: string
          order_number: number
          total: number
        }[]
      }
      register_login_failure: {
        Args: { p_email: string; p_user_agent?: string }
        Returns: boolean
      }
      register_login_success: { Args: never; Returns: undefined }
      request_client_ip: { Args: never; Returns: string }
      request_service: {
        Args: { _table_id: string; _type: string }
        Returns: undefined
      }
      submit_guarded_contact_request: {
        Args: {
          p_created_at: string
          p_dedupe_key: string
          p_email: string
          p_email_hash: string
          p_empresa: string
          p_ip_hash: string
          p_mensagem: string
          p_nome: string
          p_orcamento: string
          p_quer_reuniao: boolean
          p_request_id: string
          p_secret: string
          p_telefone: string
          p_tipo_projeto: string
        }
        Returns: {
          allowed: boolean
          duplicate: boolean
          email_limited: boolean
          ip_limited: boolean
          request_id: string
        }[]
      }
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
