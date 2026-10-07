export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      menu_categories: {
        Row: {
          id: string;
          name: string;
          restaurant_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          restaurant_id: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          restaurant_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_items: {
        Row: {
          available: boolean;
          category_id: string | null;
          created_at: string;
          description: string;
          featured: boolean;
          id: string;
          image: string;
          name: string;
          price: number;
          restaurant_id: string;
          sort_order: number;
        };
        Insert: {
          available?: boolean;
          category_id?: string | null;
          created_at?: string;
          description?: string;
          featured?: boolean;
          id?: string;
          image?: string;
          name: string;
          price?: number;
          restaurant_id: string;
          sort_order?: number;
        };
        Update: {
          available?: boolean;
          category_id?: string | null;
          created_at?: string;
          description?: string;
          featured?: boolean;
          id?: string;
          image?: string;
          name?: string;
          price?: number;
          restaurant_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          name: string;
          order_id: string;
          price: number;
          product_id: string | null;
          qty: number;
          restaurant_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          order_id: string;
          price: number;
          product_id?: string | null;
          qty: number;
          restaurant_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          order_id?: string;
          price?: number;
          product_id?: string | null;
          qty?: number;
          restaurant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          client_token: string;
          closed: boolean;
          created_at: string;
          id: string;
          note: string;
          order_number: number;
          restaurant_id: string;
          status: string;
          table_id: string | null;
          table_number: number;
          total: number;
        };
        Insert: {
          client_token?: string;
          closed?: boolean;
          created_at?: string;
          id?: string;
          note?: string;
          order_number: number;
          restaurant_id: string;
          status?: string;
          table_id?: string | null;
          table_number: number;
          total?: number;
        };
        Update: {
          client_token?: string;
          closed?: boolean;
          created_at?: string;
          id?: string;
          note?: string;
          order_number?: number;
          restaurant_id?: string;
          status?: string;
          table_id?: string | null;
          table_number?: number;
          total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };
      reservations: {
        Row: {
          created_at: string;
          date: string;
          email: string;
          guests: number;
          id: string;
          name: string;
          notes: string;
          origin: string;
          phone: string;
          restaurant_id: string;
          status: string;
          table_number: number | null;
          time: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          email?: string;
          guests: number;
          id?: string;
          name: string;
          notes?: string;
          origin?: string;
          phone?: string;
          restaurant_id: string;
          status?: string;
          table_number?: number | null;
          time: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          email?: string;
          guests?: number;
          id?: string;
          name?: string;
          notes?: string;
          origin?: string;
          phone?: string;
          restaurant_id?: string;
          status?: string;
          table_number?: number | null;
          time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_settings: {
        Row: {
          address: string;
          email: string;
          features: Json;
          hours: string[];
          introduction: string;
          logo: string;
          next_order: number;
          phone: string;
          primary_color: string;
          restaurant_id: string;
          tagline: string;
          updated_at: string;
        };
        Insert: {
          address?: string;
          email?: string;
          features?: Json;
          hours?: string[];
          introduction?: string;
          logo?: string;
          next_order?: number;
          phone?: string;
          primary_color?: string;
          restaurant_id: string;
          tagline?: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          email?: string;
          features?: Json;
          hours?: string[];
          introduction?: string;
          logo?: string;
          next_order?: number;
          phone?: string;
          primary_color?: string;
          restaurant_id?: string;
          tagline?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: true;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurants: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      service_requests: {
        Row: {
          created_at: string;
          id: string;
          resolved: boolean;
          restaurant_id: string;
          table_id: string | null;
          table_number: number;
          type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          resolved?: boolean;
          restaurant_id: string;
          table_id?: string | null;
          table_number: number;
          type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          resolved?: boolean;
          restaurant_id?: string;
          table_id?: string | null;
          table_number?: number;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_requests_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "tables";
            referencedColumns: ["id"];
          },
        ];
      };
      tables: {
        Row: {
          active: boolean;
          id: string;
          number: number;
          restaurant_id: string;
          seats: number;
        };
        Insert: {
          active?: boolean;
          id?: string;
          number: number;
          restaurant_id: string;
          seats?: number;
        };
        Update: {
          active?: boolean;
          id?: string;
          number?: number;
          restaurant_id?: string;
          seats?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tables_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_reservation: {
        Args: {
          _date: string;
          _email: string;
          _guests: number;
          _name: string;
          _notes: string;
          _phone: string;
          _time: string;
        };
        Returns: undefined;
      };
      free_table: {
        Args: { _number: number; _restaurant_id: string };
        Returns: undefined;
      };
      place_order: {
        Args: { _items: Json; _note: string; _table_id: string };
        Returns: {
          client_token: string;
          id: string;
          order_number: number;
          total: number;
        }[];
      };
      request_service: {
        Args: { _table_id: string; _type: string };
        Returns: undefined;
      };
      reset_demo: { Args: never; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
