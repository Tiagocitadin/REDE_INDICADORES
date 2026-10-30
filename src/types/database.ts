// Gerado a partir do banco Supabase (não editar à mão).
// Para atualizar: npx supabase gen types typescript --project-id itiovaurhnwrcxwpfsvy > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      auditoria: {
        Row: {
          acao: string
          campos: string[] | null
          criado_em: string
          id: number
          organizacao_id: string
          registro_id: string
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          campos?: string[] | null
          criado_em?: string
          id?: never
          organizacao_id: string
          registro_id: string
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          campos?: string[] | null
          criado_em?: string
          id?: never
          organizacao_id?: string
          registro_id?: string
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      cursos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          descricao: string | null
          id: string
          nome: string
          organizacao_id: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
          organizacao_id: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
          organizacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      membros: {
        Row: {
          criado_em: string
          organizacao_id: string
          papel: Database["public"]["Enums"]["papel_membro"]
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          organizacao_id: string
          papel?: Database["public"]["Enums"]["papel_membro"]
          usuario_id: string
        }
        Update: {
          criado_em?: string
          organizacao_id?: string
          papel?: Database["public"]["Enums"]["papel_membro"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      organizacoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          nome: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      pessoas: {
        Row: {
          ancestrais: string[]
          atualizado_em: string
          consentimento_em: string | null
          criado_em: string
          criado_por: string | null
          curso_id: string
          descricao: string | null
          email: string | null
          excluido_em: string | null
          id: string
          indicado_por_id: string | null
          nivel: number
          nome: string
          organizacao_id: string
          status: Database["public"]["Enums"]["status_curso"]
          telefone: string | null
        }
        Insert: {
          ancestrais?: string[]
          atualizado_em?: string
          consentimento_em?: string | null
          criado_em?: string
          criado_por?: string | null
          curso_id: string
          descricao?: string | null
          email?: string | null
          excluido_em?: string | null
          id?: string
          indicado_por_id?: string | null
          nivel?: number
          nome: string
          organizacao_id: string
          status?: Database["public"]["Enums"]["status_curso"]
          telefone?: string | null
        }
        Update: {
          ancestrais?: string[]
          atualizado_em?: string
          consentimento_em?: string | null
          criado_em?: string
          criado_por?: string | null
          curso_id?: string
          descricao?: string | null
          email?: string | null
          excluido_em?: string | null
          id?: string
          indicado_por_id?: string | null
          nivel?: number
          nome?: string
          organizacao_id?: string
          status?: Database["public"]["Enums"]["status_curso"]
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_organizacao_id_curso_id_fkey"
            columns: ["organizacao_id", "curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["organizacao_id", "id"]
          },
          {
            foreignKeyName: "pessoas_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_organizacao_id_indicado_por_id_fkey"
            columns: ["organizacao_id", "indicado_por_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["organizacao_id", "id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonimizar_pessoa: { Args: { p_pessoa_id: string }; Returns: undefined }
      criar_organizacao: { Args: { p_nome: string }; Returns: string }
      filhos_rede: {
        Args: { p_organizacao_id: string; p_pai_id?: string }
        Returns: {
          curso_id: string
          curso_nome: string
          diretas: number
          excluido: boolean
          id: string
          nivel: number
          nome: string
          status: Database["public"]["Enums"]["status_curso"]
          total_rede: number
        }[]
      }
      ranking_rede: {
        Args: {
          p_curso_id?: string
          p_limite?: number
          p_organizacao_id: string
        }
        Returns: {
          concluidos: number
          diretas: number
          nome: string
          pessoa_id: string
          total_rede: number
        }[]
      }
      resumo_rede: {
        Args: {
          p_curso_id?: string
          p_organizacao_id: string
          p_pessoa_id?: string
        }
        Returns: Json
      }
    }
    Enums: {
      papel_membro: "dono" | "admin" | "operador"
      status_curso: "cadastrado" | "matriculado" | "concluido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      papel_membro: ["dono", "admin", "operador"],
      status_curso: ["cadastrado", "matriculado", "concluido"],
    },
  },
} as const
