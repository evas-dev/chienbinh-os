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
      app_config: {
        Row: {
          key: string
          value: Json | null
        }
        Insert: {
          key: string
          value?: Json | null
        }
        Update: {
          key?: string
          value?: Json | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          description: string | null
          icon: string | null
          name: string
          rarity: string | null
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          name: string
          rarity?: string | null
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          name?: string
          rarity?: string | null
        }
        Relationships: []
      }
      commendations: {
        Row: {
          badge_code: string | null
          created_at: string | null
          id: string
          proposed_by: string | null
          reason: string | null
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
        }
        Insert: {
          badge_code?: string | null
          created_at?: string | null
          id?: string
          proposed_by?: string | null
          reason?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
        }
        Update: {
          badge_code?: string | null
          created_at?: string | null
          id?: string
          proposed_by?: string | null
          reason?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "commendations_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "commendations_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commendations_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commendations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exp_log: {
        Row: {
          created_at: string | null
          created_by: string | null
          delta: number
          id: string
          phone: string
          reason: string
          ref_id: string | null
          ref_table: string | null
          season_delta: number
          warrior_id: string
          warrior_name: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delta: number
          id?: string
          phone: string
          reason: string
          ref_id?: string | null
          ref_table?: string | null
          season_delta?: number
          warrior_id: string
          warrior_name?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delta?: number
          id?: string
          phone?: string
          reason?: string
          ref_id?: string | null
          ref_table?: string | null
          season_delta?: number
          warrior_id?: string
          warrior_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exp_log_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exp_log_warrior_id_fkey"
            columns: ["warrior_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed: {
        Row: {
          actor_id: string | null
          created_at: string | null
          icon: string | null
          id: string
          text: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          text: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_reports: {
        Row: {
          created_at: string | null
          id: string
          mission_id: string | null
          proof: string | null
          quantity: number | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          submitter_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mission_id?: string | null
          proof?: string | null
          quantity?: number | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitter_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mission_id?: string | null
          proof?: string | null
          quantity?: number | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_reports_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_reports_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          assignee_id: string | null
          assigner_id: string | null
          badge_reward: string | null
          created_at: string | null
          current: number | null
          deadline: string | null
          exp: number | null
          fixed: boolean | null
          icon: string | null
          id: string
          parent_id: string | null
          status: Database["public"]["Enums"]["mission_status"] | null
          target: number | null
          title: string
          type: Database["public"]["Enums"]["mission_type"]
          unit: string | null
        }
        Insert: {
          assignee_id?: string | null
          assigner_id?: string | null
          badge_reward?: string | null
          created_at?: string | null
          current?: number | null
          deadline?: string | null
          exp?: number | null
          fixed?: boolean | null
          icon?: string | null
          id?: string
          parent_id?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          target?: number | null
          title: string
          type: Database["public"]["Enums"]["mission_type"]
          unit?: string | null
        }
        Update: {
          assignee_id?: string | null
          assigner_id?: string | null
          badge_reward?: string | null
          created_at?: string | null
          current?: number | null
          deadline?: string | null
          exp?: number | null
          fixed?: boolean | null
          icon?: string | null
          id?: string
          parent_id?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          target?: number | null
          title?: string
          type?: Database["public"]["Enums"]["mission_type"]
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_assigner_id_fkey"
            columns: ["assigner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_badge_reward_fkey"
            columns: ["badge_reward"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "missions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_items: {
        Row: {
          current: number
          id: string
          metric: string
          metric_key: string | null
          objective_id: string | null
          target: number
          unit: string | null
          weight: number
        }
        Insert: {
          current?: number
          id?: string
          metric: string
          metric_key?: string | null
          objective_id?: string | null
          target: number
          unit?: string | null
          weight?: number
        }
        Update: {
          current?: number
          id?: string
          metric?: string
          metric_key?: string | null
          objective_id?: string | null
          target?: number
          unit?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "objective_items_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          created_at: string | null
          id: string
          month: number
          owner_id: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: number
          owner_id?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number
          owner_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "objectives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      penalties: {
        Row: {
          code: string
          exp_delta: number
          extra: string | null
          name: string
          severity: Database["public"]["Enums"]["severity_type"] | null
        }
        Insert: {
          code: string
          exp_delta: number
          extra?: string | null
          name: string
          severity?: Database["public"]["Enums"]["severity_type"] | null
        }
        Update: {
          code?: string
          exp_delta?: number
          extra?: string | null
          name?: string
          severity?: Database["public"]["Enums"]["severity_type"] | null
        }
        Relationships: []
      }
      penalty_log: {
        Row: {
          applied_by: string | null
          created_at: string | null
          id: string
          penalty_code: string | null
          reason: string | null
          warrior_id: string | null
        }
        Insert: {
          applied_by?: string | null
          created_at?: string | null
          id?: string
          penalty_code?: string | null
          reason?: string | null
          warrior_id?: string | null
        }
        Update: {
          applied_by?: string | null
          created_at?: string | null
          id?: string
          penalty_code?: string | null
          reason?: string | null
          warrior_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "penalty_log_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalty_log_penalty_code_fkey"
            columns: ["penalty_code"]
            isOneToOne: false
            referencedRelation: "penalties"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "penalty_log_warrior_id_fkey"
            columns: ["warrior_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string | null
          dept: string | null
          exp: number
          front: Database["public"]["Enums"]["front_type"] | null
          highest_rank_ord: number
          id: string
          name: string
          phone: string
          role: Database["public"]["Enums"]["role_type"]
          season_points: number
          squad_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          dept?: string | null
          exp?: number
          front?: Database["public"]["Enums"]["front_type"] | null
          highest_rank_ord?: number
          id: string
          name: string
          phone: string
          role?: Database["public"]["Enums"]["role_type"]
          season_points?: number
          squad_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          dept?: string | null
          exp?: number
          front?: Database["public"]["Enums"]["front_type"] | null
          highest_rank_ord?: number
          id?: string
          name?: string
          phone?: string
          role?: Database["public"]["Enums"]["role_type"]
          season_points?: number
          squad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          id: number
          insignia: string | null
          min_exp: number
          name: string
          ord: number
          tier: string | null
        }
        Insert: {
          id?: number
          insignia?: string | null
          min_exp: number
          name: string
          ord: number
          tier?: string | null
        }
        Update: {
          id?: number
          insignia?: string | null
          min_exp?: number
          name?: string
          ord?: number
          tier?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          cost: string | null
          icon: string | null
          id: number
          name: string
        }
        Insert: {
          cost?: string | null
          icon?: string | null
          id?: number
          name: string
        }
        Update: {
          cost?: string | null
          icon?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          created_at: string
          squad_id: string
          warrior_id: string
        }
        Insert: {
          created_at?: string
          squad_id: string
          warrior_id: string
        }
        Update: {
          created_at?: string
          squad_id?: string
          warrior_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_members_warrior_id_fkey"
            columns: ["warrior_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          dept: string | null
          deputy_id: string | null
          front: Database["public"]["Enums"]["front_type"] | null
          id: string
          leader_id: string | null
          name: string
        }
        Insert: {
          dept?: string | null
          deputy_id?: string | null
          front?: Database["public"]["Enums"]["front_type"] | null
          id: string
          leader_id?: string | null
          name: string
        }
        Update: {
          dept?: string | null
          deputy_id?: string | null
          front?: Database["public"]["Enums"]["front_type"] | null
          id?: string
          leader_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_squad_deputy"
            columns: ["deputy_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_squad_leader"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assigner_id: string | null
          assigner_phone: string
          content: Json
          created_at: string | null
          exp_granted: number | null
          id: string
          kpi_deltas: Json | null
          mission_ref: string
          mission_title: string
          reject_reason: string | null
          reverted_at: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          round: number | null
          status: Database["public"]["Enums"]["approval_status"] | null
          submitter_id: string | null
          submitter_phone: string
        }
        Insert: {
          assigner_id?: string | null
          assigner_phone: string
          content?: Json
          created_at?: string | null
          exp_granted?: number | null
          id?: string
          kpi_deltas?: Json | null
          mission_ref: string
          mission_title: string
          reject_reason?: string | null
          reverted_at?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          round?: number | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitter_id?: string | null
          submitter_phone: string
        }
        Update: {
          assigner_id?: string | null
          assigner_phone?: string
          content?: Json
          created_at?: string | null
          exp_granted?: number | null
          id?: string
          kpi_deltas?: Json | null
          mission_ref?: string
          mission_title?: string
          reject_reason?: string | null
          reverted_at?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          round?: number | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitter_id?: string | null
          submitter_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assigner_id_fkey"
            columns: ["assigner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_mission_ref_uuid_fkey"
            columns: ["mission_ref"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          cancelled_at: string | null
          content: string | null
          created_at: string | null
          id: string
          requester_id: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          target_id: string | null
          type: Database["public"]["Enums"]["support_type"]
        }
        Insert: {
          cancelled_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          target_id?: string | null
          type: Database["public"]["Enums"]["support_type"]
        }
        Update: {
          cancelled_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          target_id?: string | null
          type?: Database["public"]["Enums"]["support_type"]
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_log: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          actor_phone: string | null
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          actor_phone?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          actor_phone?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "system_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      warrior_badges: {
        Row: {
          awarded_at: string | null
          badge_code: string
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          warrior_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_code: string
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          warrior_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_code?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          warrior_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warrior_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "warrior_badges_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warrior_badges_warrior_id_fkey"
            columns: ["warrior_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_mission: { Args: { p_mission_id: string }; Returns: undefined }
      admin_create_warrior: {
        Args: {
          p_dept: string
          p_front: Database["public"]["Enums"]["front_type"]
          p_name: string
          p_phone: string
          p_role: Database["public"]["Enums"]["role_type"]
          p_squad_id?: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_set_active: {
        Args: { p_active: boolean; p_warrior_id: string }
        Returns: undefined
      }
      apply_penalty: {
        Args: { p_code: string; p_reason: string; p_warrior_id: string }
        Returns: undefined
      }
      approve_commendation: {
        Args: { p_commendation_id: string }
        Returns: undefined
      }
      approve_submission: { Args: { p_submission_id: string }; Returns: Json }
      assign_objective_item: {
        Args: {
          p_confirm?: boolean
          p_metric: string
          p_metric_key: string
          p_owner_id: string
          p_target: number
          p_unit: string
          p_weight: number
        }
        Returns: string
      }
      assign_squad_member: {
        Args: { p_squad_id: string; p_squad_role: string; p_warrior_id: string }
        Returns: undefined
      }
      cancel_support_request: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      create_mission: {
        Args: {
          p_assignee_id: string
          p_badge_reward: string
          p_deadline: string
          p_exp: number
          p_fixed: boolean
          p_icon: string
          p_parent_id: string
          p_target: number
          p_title: string
          p_type: Database["public"]["Enums"]["mission_type"]
          p_unit: string
        }
        Returns: string
      }
      create_squad: {
        Args: {
          p_dept: string
          p_deputy_id: string
          p_front: Database["public"]["Enums"]["front_type"]
          p_id: string
          p_leader_id: string
          p_name: string
        }
        Returns: undefined
      }
      create_support_request: {
        Args: {
          p_content: string
          p_target_id: string
          p_type: Database["public"]["Enums"]["support_type"]
        }
        Returns: string
      }
      current_profile: {
        Args: never
        Returns: {
          active: boolean
          created_at: string | null
          dept: string | null
          exp: number
          front: Database["public"]["Enums"]["front_type"] | null
          highest_rank_ord: number
          id: string
          name: string
          phone: string
          role: Database["public"]["Enums"]["role_type"]
          season_points: number
          squad_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_role_type: {
        Args: never
        Returns: Database["public"]["Enums"]["role_type"]
      }
      health_check: {
        Args: never
        Returns: string
      }
      log_auth_event: {
        Args: { p_event_type: string; p_payload?: Json }
        Returns: undefined
      }
      propose_commendation: {
        Args: { p_badge_code: string; p_reason: string; p_staff_id: string }
        Returns: string
      }
      reject_commendation: {
        Args: { p_commendation_id: string }
        Returns: undefined
      }
      reject_submission: {
        Args: { p_reason: string; p_submission_id: string }
        Returns: undefined
      }
      respond_support_request: {
        Args: { p_approve: boolean; p_request_id: string }
        Returns: undefined
      }
      revert_submission_to_rejected: {
        Args: { p_reason: string; p_submission_id: string }
        Returns: undefined
      }
      revoke_commendation: {
        Args: { p_commendation_id: string; p_reason: string }
        Returns: undefined
      }
      set_bonus_config: {
        Args: { p_months: number; p_pool: number }
        Returns: undefined
      }
      submit_mission_result: {
        Args: { p_content: Json; p_mission_id: string }
        Returns: string
      }
    }
    Enums: {
      approval_status: "cho_duyet" | "da_duyet" | "tu_choi"
      front_type: "hau_phuong" | "tien_tuyen"
      mission_status: "todo" | "doing" | "review" | "done"
      mission_type: "chien_dich" | "thang" | "ngay"
      role_type: "tong_tu_lenh" | "tu_lenh" | "chien_sy"
      severity_type: "nhe" | "vua" | "nang" | "rat_nang"
      support_type:
        | "ho_tro_quan_ly"
        | "ho_tro_nhan_su"
        | "nghi_phep"
        | "de_xuat"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      approval_status: ["cho_duyet", "da_duyet", "tu_choi"],
      front_type: ["hau_phuong", "tien_tuyen"],
      mission_status: ["todo", "doing", "review", "done"],
      mission_type: ["chien_dich", "thang", "ngay"],
      role_type: ["tong_tu_lenh", "tu_lenh", "chien_sy"],
      severity_type: ["nhe", "vua", "nang", "rat_nang"],
      support_type: [
        "ho_tro_quan_ly",
        "ho_tro_nhan_su",
        "nghi_phep",
        "de_xuat",
      ],
    },
  },
} as const
