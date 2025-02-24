import {
  Spectator,
  createRoutingFactory,
  mockProvider,
  SpyObject,
  byTestId,
} from '@ngneat/spectator/jest';
import ProductDetailComponent from './product-detail.component';
import { ProductService } from '@shared/services/product.service';
import { generateFakeProduct } from '@shared/models/product.mock';
import { of } from 'rxjs';
import { DeferBlockBehavior } from '@angular/core/testing';
import { RelatedComponent } from '../../components/related/related.component';

window.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

describe('ProductDetailComponent', () => {
  let spectator: Spectator<ProductDetailComponent>;
  let productService: SpyObject<ProductService>;
  const mockProduct = generateFakeProduct();

  const createComponent = createRoutingFactory({
    component: ProductDetailComponent,
    deferBlockBehavior: DeferBlockBehavior.Manual,
    providers: [
      mockProvider(ProductService, {
        getOneBySlug: jest.fn().mockReturnValue(of(mockProduct)),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent({
      detectChanges: false,
    });
    spectator.setInput('slug', mockProduct.slug);
    productService = spectator.inject(ProductService);
  });

  it('should create', () => {
    spectator.detectChanges();
    expect(spectator.component).toBeTruthy();
  });

  it('should getOneBySlug be called', () => {
    spectator.detectChanges();
    expect(productService.getOneBySlug).toHaveBeenCalledWith(mockProduct.slug);
  });

  it('should display the product cover', () => {
    // Act
    spectator.detectChanges();

    // Assert
    const cover = spectator.query<HTMLImageElement>(byTestId('cover'));
    expect(cover).toBeTruthy();
    expect(cover?.src).toBe(mockProduct.images[0]);
  });

  it('should load related products', async () => {
    spectator.detectChanges();
    await spectator.deferBlock().renderComplete();
    const related = spectator.query(RelatedComponent);
    expect(related).toBeTruthy();
  });
});
