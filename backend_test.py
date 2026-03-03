import requests
import sys
import json
from datetime import datetime

class NailCostAPITester:
    def __init__(self, base_url="https://salon-margin-tool.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'productos': [],
            'estilos': [],
            'disenos': []
        }

    def log(self, message, success=None):
        """Log test results"""
        if success is True:
            print(f"✅ {message}")
            self.tests_passed += 1
        elif success is False:
            print(f"❌ {message}")
        else:
            print(f"🔍 {message}")
        
        self.tests_run += 1

    def run_test(self, name, method, endpoint, expected_status, data=None, test_response=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            # Check status code
            if response.status_code == expected_status:
                self.log(f"{name} - Status: {response.status_code}", True)
                
                # Test response content if provided
                if test_response and response.content:
                    try:
                        response_data = response.json()
                        if test_response(response_data):
                            self.log(f"{name} - Response validation passed", True)
                        else:
                            self.log(f"{name} - Response validation failed", False)
                            return False, {}
                    except json.JSONDecodeError:
                        self.log(f"{name} - Invalid JSON response", False)
                        return False, {}
                
                try:
                    return True, response.json() if response.content else {}
                except json.JSONDecodeError:
                    return True, {}
            else:
                self.log(f"{name} - Expected {expected_status}, got {response.status_code}", False)
                print(f"Response: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"{name} - Request timeout", False)
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log(f"{name} - Connection error", False)
            return False, {}
        except Exception as e:
            self.log(f"{name} - Error: {str(e)}", False)
            return False, {}

    def test_productos_crud(self):
        """Test all Productos CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PRODUCTOS ENDPOINTS")
        print("="*50)
        
        # GET all productos (should work even if empty)
        success, productos = self.run_test(
            "GET /productos",
            "GET",
            "productos",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # POST create producto
        test_producto = {
            "nombre": "Acrílico Test",
            "tipo": "insumo",
            "precio_compra": 25.0,
            "cantidad_comprada": 50.0,
            "unidad": "gramos",
            "uso_por_servicio": 3.0
        }
        
        success, created = self.run_test(
            "POST /productos",
            "POST",
            "productos",
            200,
            data=test_producto,
            test_response=lambda x: 'id' in x and x['nombre'] == test_producto['nombre']
        )
        
        if success and 'id' in created:
            producto_id = created['id']
            self.created_ids['productos'].append(producto_id)
            
            # PUT update producto
            updated_data = test_producto.copy()
            updated_data['nombre'] = "Acrílico Test Updated"
            
            success, updated = self.run_test(
                f"PUT /productos/{producto_id}",
                "PUT",
                f"productos/{producto_id}",
                200,
                data=updated_data,
                test_response=lambda x: x['nombre'] == updated_data['nombre']
            )
            
            # DELETE producto
            success, _ = self.run_test(
                f"DELETE /productos/{producto_id}",
                "DELETE",
                f"productos/{producto_id}",
                200
            )
            
            if success:
                self.created_ids['productos'].remove(producto_id)
        
        return True

    def test_estilos_crud(self):
        """Test all Estilos CRUD operations"""
        print("\n" + "="*50)
        print("TESTING ESTILOS ENDPOINTS")
        print("="*50)
        
        # GET all estilos
        success, estilos = self.run_test(
            "GET /estilos",
            "GET",
            "estilos",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # POST create estilo
        test_estilo = {
            "nombre": "Test Style",
            "descripcion": "Test description",
            "productos_usados": [],
            "tiempo_trabajo_minutos": 60,
            "nivel_dificultad": "medio"
        }
        
        success, created = self.run_test(
            "POST /estilos",
            "POST",
            "estilos",
            200,
            data=test_estilo,
            test_response=lambda x: 'id' in x and x['nombre'] == test_estilo['nombre']
        )
        
        if success and 'id' in created:
            estilo_id = created['id']
            self.created_ids['estilos'].append(estilo_id)
            
            # PUT update estilo
            updated_data = test_estilo.copy()
            updated_data['nombre'] = "Test Style Updated"
            
            success, updated = self.run_test(
                f"PUT /estilos/{estilo_id}",
                "PUT",
                f"estilos/{estilo_id}",
                200,
                data=updated_data,
                test_response=lambda x: x['nombre'] == updated_data['nombre']
            )
            
            # DELETE estilo
            success, _ = self.run_test(
                f"DELETE /estilos/{estilo_id}",
                "DELETE",
                f"estilos/{estilo_id}",
                200
            )
            
            if success:
                self.created_ids['estilos'].remove(estilo_id)
        
        return True

    def test_disenos_crud(self):
        """Test all Diseños CRUD operations"""
        print("\n" + "="*50)
        print("TESTING DISEÑOS ENDPOINTS")
        print("="*50)
        
        # GET all disenos
        success, disenos = self.run_test(
            "GET /disenos",
            "GET",
            "disenos",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # POST create diseno
        test_diseno = {
            "nombre": "Test Design",
            "costo_adicional": 5.0,
            "tiempo_adicional_minutos": 15,
            "nivel_complejidad": "bajo"
        }
        
        success, created = self.run_test(
            "POST /disenos",
            "POST",
            "disenos",
            200,
            data=test_diseno,
            test_response=lambda x: 'id' in x and x['nombre'] == test_diseno['nombre']
        )
        
        if success and 'id' in created:
            diseno_id = created['id']
            self.created_ids['disenos'].append(diseno_id)
            
            # PUT update diseno
            updated_data = test_diseno.copy()
            updated_data['nombre'] = "Test Design Updated"
            
            success, updated = self.run_test(
                f"PUT /disenos/{diseno_id}",
                "PUT",
                f"disenos/{diseno_id}",
                200,
                data=updated_data,
                test_response=lambda x: x['nombre'] == updated_data['nombre']
            )
            
            # DELETE diseno
            success, _ = self.run_test(
                f"DELETE /disenos/{diseno_id}",
                "DELETE",
                f"disenos/{diseno_id}",
                200
            )
            
            if success:
                self.created_ids['disenos'].remove(diseno_id)
        
        return True

    def test_gastos_endpoints(self):
        """Test Gastos Operativos endpoints"""
        print("\n" + "="*50)
        print("TESTING GASTOS ENDPOINTS")
        print("="*50)
        
        # GET gastos (should create default if not exists)
        success, gastos = self.run_test(
            "GET /gastos",
            "GET",
            "gastos",
            200,
            test_response=lambda x: 'renta' in x and 'clientes_mes' in x
        )
        
        # PUT update gastos
        update_data = {
            "renta": 500.0,
            "luz": 50.0,
            "clientes_mes": 40
        }
        
        success, updated = self.run_test(
            "PUT /gastos",
            "PUT",
            "gastos",
            200,
            data=update_data,
            test_response=lambda x: x['renta'] == update_data['renta']
        )
        
        return True

    def test_ganancias_endpoints(self):
        """Test Configuración Ganancias endpoints"""
        print("\n" + "="*50)
        print("TESTING GANANCIAS CONFIG ENDPOINTS")
        print("="*50)
        
        # GET config ganancias (should create default if not exists)
        success, config = self.run_test(
            "GET /ganancias/config",
            "GET",
            "ganancias/config",
            200,
            test_response=lambda x: 'porcentaje_ganancia' in x and 'meta_ingreso_mensual' in x
        )
        
        # PUT update config ganancias
        update_data = {
            "porcentaje_ganancia": 35.0,
            "meta_ingreso_mensual": 2500.0
        }
        
        success, updated = self.run_test(
            "PUT /ganancias/config",
            "PUT",
            "ganancias/config",
            200,
            data=update_data,
            test_response=lambda x: x['porcentaje_ganancia'] == update_data['porcentaje_ganancia']
        )
        
        return True

    def test_seed_data(self):
        """Test seed data endpoint"""
        print("\n" + "="*50)
        print("TESTING SEED DATA ENDPOINT")
        print("="*50)
        
        success, result = self.run_test(
            "POST /seed",
            "POST",
            "seed",
            200,
            test_response=lambda x: 'message' in x
        )
        
        return success

    def test_calcular_precio(self):
        """Test calcular precio endpoint (requires seed data)"""
        print("\n" + "="*50)
        print("TESTING CALCULAR PRECIO ENDPOINT")
        print("="*50)
        
        # First ensure we have seed data
        self.test_seed_data()
        
        # Get estilos to use one for calculation
        success, estilos = self.run_test(
            "GET /estilos (for calculation)",
            "GET",
            "estilos",
            200,
            test_response=lambda x: isinstance(x, list) and len(x) > 0
        )
        
        if success and estilos and len(estilos) > 0:
            estilo_id = estilos[0]['id']
            
            # Test calculation
            calc_request = {
                "estilo_id": estilo_id,
                "disenos_ids": []
            }
            
            success, result = self.run_test(
                "POST /calcular-precio",
                "POST",
                "calcular-precio",
                200,
                data=calc_request,
                test_response=lambda x: 'precio_recomendado' in x and 'costo_total' in x
            )
            
            if success:
                print(f"  Precio calculado: ${result.get('precio_recomendado', 0)}")
        
        return True

    def test_reporte(self):
        """Test reporte endpoint"""
        print("\n" + "="*50)
        print("TESTING REPORTE ENDPOINT")
        print("="*50)
        
        success, reporte = self.run_test(
            "GET /reporte",
            "GET",
            "reporte",
            200,
            test_response=lambda x: 'fecha_generacion' in x and 'servicios_ranking' in x
        )
        
        if success:
            print(f"  Total productos: {reporte.get('total_productos', 0)}")
            print(f"  Total estilos: {reporte.get('total_estilos', 0)}")
            print(f"  Total diseños: {reporte.get('total_disenos', 0)}")
        
        return success

    def test_clientes_crud(self):
        """Test all Clientes CRUD operations"""
        print("\n" + "="*50)
        print("TESTING CLIENTES ENDPOINTS")
        print("="*50)
        
        # GET all clientes
        success, clientes = self.run_test(
            "GET /clientes",
            "GET",
            "clientes",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # POST create cliente
        test_cliente = {
            "nombre": "Test Cliente",
            "telefono": "+1 234 567 8900",
            "email": "test@example.com",
            "notas": "Cliente de prueba"
        }
        
        success, created = self.run_test(
            "POST /clientes",
            "POST",
            "clientes",
            200,
            data=test_cliente,
            test_response=lambda x: 'id' in x and x['nombre'] == test_cliente['nombre']
        )
        
        cliente_id = None
        if success and 'id' in created:
            cliente_id = created['id']
            
            # GET single cliente
            success, cliente = self.run_test(
                f"GET /clientes/{cliente_id}",
                "GET",
                f"clientes/{cliente_id}",
                200,
                test_response=lambda x: x['id'] == cliente_id
            )
            
            # PUT update cliente
            updated_data = test_cliente.copy()
            updated_data['nombre'] = "Test Cliente Updated"
            
            success, updated = self.run_test(
                f"PUT /clientes/{cliente_id}",
                "PUT",
                f"clientes/{cliente_id}",
                200,
                data=updated_data,
                test_response=lambda x: x['nombre'] == updated_data['nombre']
            )
            
            # DELETE cliente (will do at end)
        
        return cliente_id

    def test_citas_crud(self):
        """Test all Citas CRUD operations"""
        print("\n" + "="*50)
        print("TESTING CITAS/AGENDA ENDPOINTS")
        print("="*50)
        
        # First get or create a cliente and estilo
        cliente_id = self.test_clientes_crud()
        
        # Ensure we have estilos
        self.test_seed_data()
        success, estilos = self.run_test(
            "GET /estilos (for citas)",
            "GET",
            "estilos",
            200,
            test_response=lambda x: isinstance(x, list) and len(x) > 0
        )
        
        if not success or not estilos:
            print("❌ No estilos available for citas testing")
            return None
        
        estilo_id = estilos[0]['id']
        
        # GET all citas
        success, citas = self.run_test(
            "GET /citas",
            "GET",
            "citas",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # Test with date filters
        success, citas_filtered = self.run_test(
            "GET /citas?fecha_desde=2024-01-01",
            "GET",
            "citas?fecha_desde=2024-01-01",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # GET citas próximas
        success, proximas = self.run_test(
            "GET /citas/proximas",
            "GET",
            "citas/proximas",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # POST create cita
        test_cita = {
            "cliente_id": cliente_id,
            "fecha": "2024-12-31",
            "hora": "14:30",
            "estilo_id": estilo_id,
            "disenos_ids": [],
            "notas": "Cita de prueba",
            "precio_estimado": 50.0
        }
        
        success, created = self.run_test(
            "POST /citas",
            "POST",
            "citas",
            200,
            data=test_cita,
            test_response=lambda x: 'id' in x and x['cliente_id'] == test_cita['cliente_id']
        )
        
        cita_id = None
        if success and 'id' in created:
            cita_id = created['id']
            
            # PUT update cita
            updated_data = {
                "estado": "confirmada",
                "notas": "Cita confirmada"
            }
            
            success, updated = self.run_test(
                f"PUT /citas/{cita_id}",
                "PUT",
                f"citas/{cita_id}",
                200,
                data=updated_data,
                test_response=lambda x: x['estado'] == updated_data['estado']
            )
        
        # Cleanup
        if cliente_id:
            self.run_test(
                f"DELETE /clientes/{cliente_id}",
                "DELETE",
                f"clientes/{cliente_id}",
                200
            )
        
        return cita_id

    def test_servicios_crud(self):
        """Test Servicios Realizados endpoints"""
        print("\n" + "="*50)
        print("TESTING SERVICIOS REALIZADOS ENDPOINTS")
        print("="*50)
        
        # GET all servicios
        success, servicios = self.run_test(
            "GET /servicios",
            "GET",
            "servicios",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # GET with filters
        success, servicios_mes = self.run_test(
            "GET /servicios?mes=12&anio=2024",
            "GET",
            "servicios?mes=12&anio=2024",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        # Create a test servicio
        # First create cliente and estilo
        cliente_id = self.test_clientes_crud()
        
        success, estilos = self.run_test(
            "GET /estilos (for servicios)",
            "GET",
            "estilos",
            200,
            test_response=lambda x: isinstance(x, list) and len(x) > 0
        )
        
        if success and estilos:
            estilo_id = estilos[0]['id']
            
            test_servicio = {
                "cliente_id": cliente_id,
                "fecha": "2024-12-15",
                "estilo_id": estilo_id,
                "disenos_ids": [],
                "precio_cobrado": 60.0,
                "costo_real": 35.0,
                "notas": "Servicio de prueba"
            }
            
            success, created = self.run_test(
                "POST /servicios",
                "POST",
                "servicios",
                200,
                data=test_servicio,
                test_response=lambda x: 'id' in x and 'ganancia' in x
            )
            
            # Cleanup
            if success and 'id' in created:
                servicio_id = created['id']
                self.run_test(
                    f"DELETE /servicios/{servicio_id}",
                    "DELETE",
                    f"servicios/{servicio_id}",
                    200
                )
        
        # Cleanup cliente
        if cliente_id:
            self.run_test(
                f"DELETE /clientes/{cliente_id}",
                "DELETE",
                f"clientes/{cliente_id}",
                200
            )
        
        return True

    def test_reportes_mensuales(self):
        """Test Reportes Mensuales endpoints"""
        print("\n" + "="*50)
        print("TESTING REPORTES MENSUALES ENDPOINTS")
        print("="*50)
        
        # GET reporte mensual
        success, reporte = self.run_test(
            "GET /reportes/mensual/2024/12",
            "GET",
            "reportes/mensual/2024/12",
            200,
            test_response=lambda x: 'periodo' in x and 'total_servicios' in x
        )
        
        if success:
            print(f"  Período: {reporte.get('periodo')}")
            print(f"  Total servicios: {reporte.get('total_servicios', 0)}")
            print(f"  Total ingresos: ${reporte.get('total_ingresos', 0)}")
        
        # GET comparativa mensual
        success, comparativa = self.run_test(
            "GET /reportes/comparativa",
            "GET",
            "reportes/comparativa",
            200,
            test_response=lambda x: 'meses' in x and isinstance(x['meses'], list)
        )
        
        return success

    def test_simulacion(self):
        """Test Simulación endpoints"""
        print("\n" + "="*50)
        print("TESTING SIMULACIÓN ENDPOINTS")
        print("="*50)
        
        # POST simulación mensual
        test_params = {
            "servicios_por_dia": 4,
            "dias_trabajo": 20
        }
        
        success, simulacion = self.run_test(
            "POST /simulacion/mensual",
            "POST",
            "simulacion/mensual",
            200,
            data=test_params,
            test_response=lambda x: 'parametros' in x and 'simulacion' in x
        )
        
        if success:
            print(f"  Servicios/mes: {simulacion.get('parametros', {}).get('servicios_mes', 0)}")
            print(f"  Simulaciones: {len(simulacion.get('simulacion', []))}")
        
        return success

    def test_alertas(self):
        """Test Alertas endpoint"""
        print("\n" + "="*50)
        print("TESTING ALERTAS ENDPOINT")
        print("="*50)
        
        success, alertas = self.run_test(
            "GET /alertas",
            "GET",
            "alertas",
            200,
            test_response=lambda x: isinstance(x, list)
        )
        
        if success:
            print(f"  Total alertas: {len(alertas)}")
        
        return success

    def cleanup_created_resources(self):
        """Clean up any resources created during testing"""
        print("\n" + "="*30)
        print("CLEANING UP TEST DATA")
        print("="*30)
        
        # Clean up productos
        for producto_id in self.created_ids['productos']:
            self.run_test(
                f"Cleanup producto {producto_id}",
                "DELETE",
                f"productos/{producto_id}",
                200
            )
        
        # Clean up estilos
        for estilo_id in self.created_ids['estilos']:
            self.run_test(
                f"Cleanup estilo {estilo_id}",
                "DELETE",
                f"estilos/{estilo_id}",
                200
            )
        
        # Clean up disenos
        for diseno_id in self.created_ids['disenos']:
            self.run_test(
                f"Cleanup diseno {diseno_id}",
                "DELETE",
                f"disenos/{diseno_id}",
                200
            )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting NailCost Pro API Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print("="*60)
        
        try:
            # Test CRUD operations for original features
            self.test_productos_crud()
            self.test_estilos_crud()
            self.test_disenos_crud()
            
            # Test configuration endpoints
            self.test_gastos_endpoints()
            self.test_ganancias_endpoints()
            
            # Test business logic endpoints
            self.test_seed_data()
            self.test_calcular_precio()
            self.test_reporte()
            
            # Test NEW features
            print("\n" + "="*50)
            print("TESTING NEW FEATURES")
            print("="*50)
            
            self.test_clientes_crud()
            self.test_citas_crud()
            self.test_servicios_crud()
            self.test_reportes_mensuales()
            self.test_simulacion()
            self.test_alertas()
            
        except KeyboardInterrupt:
            print("\n⚠️ Tests interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {str(e)}")
        finally:
            # Always clean up
            self.cleanup_created_resources()
        
        # Print final results
        print("\n" + "="*60)
        print("📊 TEST RESULTS")
        print("="*60)
        print(f"✅ Tests passed: {self.tests_passed}/{self.tests_run}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️ Some tests failed")
            return 1

def main():
    tester = NailCostAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())