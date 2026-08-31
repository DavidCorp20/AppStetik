import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Users, DollarSign, AlertTriangle, Clock, CheckCircle, XCircle, 
  CreditCard, FileText, TrendingUp, Bell, RefreshCw, Loader2, Search,
  UserCheck, UserX, Key, Play, Calendar, Building2, User, Copy, Check,
  Eye, Ban, BarChart3, Download, PieChart, ArrowUpRight, ArrowDownRight, Activity,
  ChevronRight, Filter, MoreVertical, UserPlus, Settings, Database, Server,
  Globe, Zap, TrendingDown, Percent, FileDown, Printer
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, 
  PieChart as RePieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
  ComposedChart
} from "recharts";
